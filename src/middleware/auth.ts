import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AdminModel } from '../models/Admin';
import { ApiResponse, AuthRequest } from '../types/index';
import config from '../config/environment';

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Access denied. No token provided.',
        error: 'No token provided'
      };
      res.status(401).json(response);
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    const admin = await AdminModel.findById(decoded.id);

    if (!admin) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Invalid token.',
        error: 'Admin not found'
      };
      res.status(401).json(response);
      return
    }

    req.admin = admin;
    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Invalid token.',
      error: 'Token verification failed'
    };
    res.status(401).json(response);
  }
};