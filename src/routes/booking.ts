import { Router } from 'express';
import { BookingService } from '../services/BookingService';
import { ApiResponse } from '../types/index';
import { validateRequest } from '../middleware/validateRequest';
import { bookingSchema, cancelReservationParamsSchema, otpVerificationSchema, ticketIdParamsSchema } from '../dtos/index.dto';

const router = Router();
const bookingService = new BookingService();

// Step 1: Initiate booking with email verification
router.post('/initiate', validateRequest(bookingSchema, 'body'), async (req, res) => {
  try {
    const result = await bookingService.initiateBooking(req.body);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
    res.status(500).json(response);
  }
});

// Step 2: Verify OTP and complete booking
router.post('/verify', validateRequest(otpVerificationSchema, 'body'), async (req, res) => {
  try {
    const result = await bookingService.verifyOTPAndCompleteBooking(req.body);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
    res.status(500).json(response);
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return
    }

    const result = await bookingService.resendOTP(email);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
    res.status(500).json(response);
  }
});

// Get available seats for a specific date
router.get('/seats/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await bookingService.getAvailableSeats(date);

    const statusCode = result.success ? 200 : 400;

    res.status(statusCode).json(result);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
    res.status(500).json(response);
  }
});

// Cancel/Void booking
router.post('/cancel', validateRequest(cancelReservationParamsSchema, 'body'), async (req, res) => {
  try {
    const { ticketId, reservationToken } = req.body;
    const result = await bookingService.cancelBooking({
      ticketId,
      reservationToken
    });

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);

  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
    res.status(500).json(response);
  }
});

export default router;