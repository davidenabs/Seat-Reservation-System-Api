// import Joi from 'joi';
// import { Request, Response, NextFunction } from 'express';
// import { ApiResponse } from '../types/index';


// export const validateBooking = (req: Request, res: Response, next: NextFunction) => {
//   const { error } = bookingSchema.validate(req.body);
//   if (error) {
//     const response: ApiResponse<null> = {
//       success: false,
//       message: 'Validation failed',
//       error: error.details[0].message
//     };
//     res.status(400).json(response);
//     return
//   }
//   next();
// };

// export const validateAdminLogin = (req: Request, res: Response, next: NextFunction) => {
//   const { error } = adminLoginSchema.validate(req.body);
//   if (error) {
//     const response: ApiResponse<null> = {
//       success: false,
//       message: 'Validation failed',
//       error: error.details[0].message
//     };
//     res.status(400).json(response);
//     return
//   }
//   next();
// };