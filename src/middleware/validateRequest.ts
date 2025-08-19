// src/middleware/validateRequest.ts
import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

type RequestPart = 'body' | 'query' | 'params';

export const validateRequest = (schema: ObjectSchema, type: RequestPart = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req[type], { abortEarly: false });

        if (error) {
            const data = {
                success: false,
                message: 'Invalid request parameters',
                errors: error.details.map(detail => detail.message),
            };
            logger.error(data);
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                errors: error.details.map(detail => detail.message),
        });
            return
        }

        // Replace original request data with the validated one (optional)
        req[type] = value;

        next();
    };
};
