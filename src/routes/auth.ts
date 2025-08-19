import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/Admin';
import { AuthService } from '../services/AuthService';
import { BookingService } from '../services/BookingService';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateAdmin } from '../middleware/auth';
import {
    adminLoginSchema,
    createAdminSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateAdminSchema,
    adminQuerySchema,
} from '../dtos/index.dto';
import { AuthRequest } from '../types';

const router = Router();
const authService = new AuthService();

// Admin login
router.post('/login', validateRequest(adminLoginSchema, 'body'), async (req, res) => {
    try {
        const result = await authService.login(req.body);
        const statusCode = result.success ? 200 : 401;
        res.status(statusCode).json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Forgot password
router.post('/forgot-password', validateRequest(forgotPasswordSchema, 'body'), async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body);
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Forgot password request failed',
            error: error.message
        });
    }
});

// Reset password
router.post('/reset-password', validateRequest(resetPasswordSchema, 'body'), async (req, res) => {
    try {
        const result = await authService.resetPassword(req.body);
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Password reset failed',
            error: error.message
        });
    }
});

// Protected Routes (Authentication required)

// Get current admin profile
router.get('/profile', authenticateAdmin, async (req: AuthRequest, res) => {
    try {
        const admin = await AdminModel.findById(req.admin.id)
            .select('-password -resetPasswordToken -resetPasswordExpiry')
            .populate('createdBy', 'username email');

        if (!admin) {
            res.status(404).json({
                success: false,
                message: 'Admin not found',
                error: 'Invalid admin ID'
            });
            return
        }

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: admin
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile',
            error: error.message
        });
    }
});

// Update current admin profile
router.put('/profile', authenticateAdmin, validateRequest(updateAdminSchema, 'body'), async (req: AuthRequest, res) => {
    try {
        const { username, email, phone } = req.body;

        // Check if username or email already exists (excluding current admin)
        if (username || email) {
            const query: any = { _id: { $ne: req.admin.id } };
            if (username) query.$or = [{ username }];
            if (email) query.$or = query.$or ? [...query.$or, { email }] : [{ email }];

            const existingAdmin = await AdminModel.findOne(query);
            if (existingAdmin) {
                res.status(400).json({
                    success: false,
                    message: 'Username or email already taken',
                    error: 'Duplicate credentials'
                });
                return
            }
        }

        const admin = await AdminModel.findByIdAndUpdate(
            req.admin.id,
            { username, email, phone },
            { new: true, runValidators: true }
        ).select('-password -resetPasswordToken -resetPasswordExpiry');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: admin
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
});

// Change password
router.post('/change-password', authenticateAdmin, validateRequest(changePasswordSchema, 'body'), async (req: AuthRequest, res) => {
    try {
        const result = await authService.changePassword(req.admin.id, req.body);
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Password change failed',
            error: error.message
        });
    }
});

// Super Admin Routes (Superadmin access required)

// Create new admin
router.post('/create', authenticateAdmin, validateRequest(createAdminSchema, 'body'), async (req: AuthRequest, res) => {
    try {
        const result = await authService.createAdmin(req.body, req.admin.id);
        const statusCode = result.success ? 201 : 400;
        res.status(statusCode).json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Admin creation failed',
            error: error.message
        });
    }
});

// Get all admins (with pagination and search)
router.get('/list', authenticateAdmin, validateRequest(adminQuerySchema, 'query'), async (req, res) => {
    try {
        const { page, limit, search, role, isActive } = req.query as any;

        const query: any = {};

        // Search functionality
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { username: regex },
                { email: regex }
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by active status
        if (typeof isActive === 'boolean') {
            query.isActive = isActive;
        }

        const skip = (page - 1) * limit;

        const [admins, total] = await Promise.all([
            AdminModel.find(query)
                .select('-password -resetPasswordToken -resetPasswordExpiry')
                .populate('createdBy', 'username email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AdminModel.countDocuments(query)
        ]);

        res.json({
            success: true,
            message: 'Admins retrieved successfully',
            data: admins,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve admins',
            error: error.message
        });
    }
});

// Get specific admin
// router.get('/:adminId', authenticateAdmin, requireSuperAdmin, async (req, res) => {
//   try {
//     const admin = await AdminModel.findById(req.params.adminId)
//       .select('-password -resetPasswordToken -resetPasswordExpiry')
//       .populate('createdBy', 'username email');

//     if (!admin) {
//       return res.status(404).json({



export default router;