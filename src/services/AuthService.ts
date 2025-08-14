import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AdminModel } from '@/models/Admin';
import { ApiResponse, LoginRequest, CreateAdminRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types';
import config from '@/config/environment';
import { logger } from '@/utils/logger';
import { NotificationService } from './NotificationService';



export class AuthService {

  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  // Generate JWT token
  private generateToken(admin: any): string {
    return jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      config.jwt.secret,
      // { expiresIn: config.jwt.expiresIn as string }
    );
  }

  // Generate password reset token
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Login admin
  async login(loginData: LoginRequest): Promise<ApiResponse<any>> {
    try {
      const { username, password } = loginData;

      // Find admin by username or email
      const admin = await AdminModel.findOne({
        $or: [{ username }, { email: username }]
      });

      if (!admin) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'Admin not found'
        };
      }

      // Check password
      const isValidPassword = await admin.comparePassword(password);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'Wrong password'
        };
      }

      // Generate token
      const token = this.generateToken(admin);

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            lastLogin: admin.lastLogin
          }
        }
      };

    } catch (error: any) {
      logger.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: error.message
      };
    }
  }

  // Create new admin
  async createAdmin(adminData: CreateAdminRequest, creatorId: string): Promise<ApiResponse<any>> {
    try {
      // Check if creator is superadmin
      const creator = await AdminModel.findById(creatorId);
      if (!creator || creator.role !== 'superadmin') {
        return {
          success: false,
          message: 'Insufficient permissions',
          error: 'Only superadmin can create new admins'
        };
      }

      // Check if admin already exists
      const existingAdmin = await AdminModel.findOne({
        $or: [
          { username: adminData.username },
          { email: adminData.email }
        ]
      });

      if (existingAdmin) {
        return {
          success: false,
          message: 'Admin already exists',
          error: 'Username or email already taken'
        };
      }

      // Create new admin
      const newAdmin = new AdminModel({
        username: adminData.username,
        email: adminData.email,
        password: adminData.password, // Will be hashed by pre-save hook
        role: adminData.role,
        phone: adminData.phone,
        createdBy: creatorId
      });

      await newAdmin.save();

      // Send welcome email
      try {
        await this.notificationService.sendWelcomeEmail(newAdmin, adminData.password);
      } catch (emailError) {
        logger.error('Welcome email error:', emailError);
        // Continue even if email fails
      }

      return {
        success: true,
        message: 'Admin created successfully',
        data: {
          admin: {
            id: newAdmin._id,
            username: newAdmin.username,
            email: newAdmin.email,
            role: newAdmin.role,
            // createdAt: newAdmin.createdAt
          }
        }
      };

    } catch (error: any) {
      logger.error('Create admin error:', error);
      return {
        success: false,
        message: 'Failed to create admin',
        error: error.message
      };
    }
  }

  // Change password
  async changePassword(adminId: string, passwordData: ChangePasswordRequest): Promise<ApiResponse<any>> {
    try {
      const { currentPassword, newPassword } = passwordData;

      // Find admin
      const admin = await AdminModel.findById(adminId);
      if (!admin) {
        return {
          success: false,
          message: 'Admin not found',
          error: 'Invalid admin ID'
        };
      }

      // Verify current password
      const isValidCurrentPassword = await admin.comparePassword(currentPassword);
      if (!isValidCurrentPassword) {
        return {
          success: false,
          message: 'Current password is incorrect',
          error: 'Invalid current password'
        };
      }

      // Update password
      admin.password = newPassword; // Will be hashed by pre-save hook
      admin.passwordChangedAt = new Date();
      await admin.save();

      // Send notification email
      try {
        await this.notificationService.sendPasswordChangeNotification(admin);
      } catch (emailError) {
        logger.error('Password change notification error:', emailError);
      }

      return {
        success: true,
        message: 'Password changed successfully',
        data: null
      };

    } catch (error: any) {
      logger.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
        error: error.message
      };
    }
  }

  // Forgot password
  async forgotPassword(forgotData: ForgotPasswordRequest): Promise<ApiResponse<any>> {
    try {
      const { email } = forgotData;

      // Find admin by email
      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        // Return success even if email not found for security
        return {
          success: true,
          message: 'If the email exists, a reset link has been sent',
          data: null
        };
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save reset token
      admin.resetPasswordToken = resetToken;
      admin.resetPasswordExpiry = resetTokenExpiry;
      await admin.save();

      // Send reset email
      await this.notificationService.sendPasswordResetEmail(admin, resetToken);

      return {
        success: true,
        message: 'Password reset link sent to your email',
        data: null
      };

    } catch (error: any) {
      logger.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to process forgot password request',
        error: error.message
      };
    }
  }

  // Reset password
  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse<any>> {
    try {
      const { token, newPassword } = resetData;

      // Find admin with valid reset token
      const admin = await AdminModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: new Date() }
      });

      if (!admin) {
        return {
          success: false,
          message: 'Invalid or expired reset token',
          error: 'Token not valid'
        };
      }

      // Update password and clear reset token
      admin.password = newPassword; // Will be hashed by pre-save hook
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpiry = undefined;
      admin.passwordChangedAt = new Date();
      await admin.save();

      // Send confirmation email
      try {
        await this.notificationService.sendPasswordResetConfirmation(admin);
      } catch (emailError) {
        logger.error('Reset confirmation email error:', emailError);
      }

      return {
        success: true,
        message: 'Password reset successfully',
        data: null
      };

    } catch (error: any) {
      logger.error('Reset password error:', error);
      return {
        success: false,
        message: 'Failed to reset password',
        error: error.message
      };
    }
  }
}