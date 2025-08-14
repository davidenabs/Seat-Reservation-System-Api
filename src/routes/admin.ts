

import { Router } from 'express';
import { UserModel } from '@/models/User';
import { EventModel } from '@/models/Event';
import { BookingModel } from '@/models/Booking';
import { NotificationService } from '@/services/NotificationService';
import { startOfDay, endOfDay } from 'date-fns';
import { validateRequest } from '@/middleware/validateRequest';
import { getAllBookingsSchema, ticketIdParamsSchema } from '@/dtos/index.dto';
import { ApiResponse } from '@/types';
import { BookingService } from '@/services/BookingService';
import { SettingsService } from '@/services/SettingsService';
import { EventService } from '@/services/EventService';

const router = Router();
const notificationService = new NotificationService();
const bookingService = new BookingService();
const settingsService = new SettingsService();
const eventService = new EventService();

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Today's registrations
    const todayRegistrations = await BookingModel.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'cancelled' }
    });

    // Total registrations
    const totalRegistrations = await BookingModel.countDocuments({
      status: { $ne: 'cancelled' }
    });

    // Gender distribution
    const genderStats = await UserModel.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age distribution
    const ageStats = await UserModel.aggregate([
      {
        $group: {
          _id: '$ageRange',
          count: { $sum: 1 }
        }
      }
    ]);

    // Upcoming events
    const upcomingEvents = await EventModel.find({
      date: { $gte: today },
      isActive: true
    }).sort({ date: 1 }).limit(5);

    // Recent bookings
    const recentBookings = await BookingModel.find()
      .populate('userId', 'name email')
      .populate('eventId', 'date time')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        todayRegistrations,
        totalRegistrations,
        genderStats,
        ageStats,
        upcomingEvents,
        recentBookings
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
});

router.get('/bookings', validateRequest(getAllBookingsSchema), async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      status,
    } = req.query;

    const result = await bookingService.getAllBookings({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      search: search as string,
      status: status as string,
    });

    res.status(200).json(result);
  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message,
    };
    res.status(500).json(response);
  }
});

// Get booking by ticket ID
router.get('/bookings/:ticketId', validateRequest(ticketIdParamsSchema, 'params'), async (req, res) => {
  try {
    const result = await bookingService.getBookingByTicketId(req.params.ticketId);
    const statusCode = result.success ? 200 : 404;
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
router.patch('/bookings/:ticketId/cancel', validateRequest(ticketIdParamsSchema, 'params'), async (req, res) => {
  try {
    const result = await bookingService.adminCancelBooking(req.params.ticketId);

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

// Verify booking (for QR code scanning)
router.get('/bookings/:ticketId/verify', validateRequest(ticketIdParamsSchema, 'params'), async (req, res) => {
  try {
    const result = await bookingService.verifyBooking(req.params.ticketId);
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

// Get upcoming events with pagination
router.get('/events/upcoming', validateRequest(getAllBookingsSchema), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      includeFullyBooked,
      startDate,
      endDate
    } = req.query;

    const result = await bookingService.getUpcomingEvents({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      includeFullyBooked: includeFullyBooked as unknown as boolean,
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.status(200).json(result);

  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
    res.status(500).json(response);
  }
});

// Get upcoming events summary (without pagination) - useful for dashboards
router.get('/events/summary', async (req, res) => {
  try {
    const result = await bookingService.getUpcomingEventsSummary();
    res.status(200).json(result);

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events summary',
      error: error.message
    });
  }
});

// Update system settings
router.put('/settings', async (req, res) => {
  try {
    const {
      reservationOpenDate,
      reservationCloseDate,
      defaultTotalSeats,
      eventTimes,
      workingDays,
      maxSeatsPerUser
    } = req.body;

    const result = await settingsService.updateSettings({
      reservationOpenDate,
      reservationCloseDate,
      defaultTotalSeats,
      eventTimes,
      workingDays,
      maxSeatsPerUser
    });

    res.status(200).json(result);

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
});

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    const result = await settingsService.getSettings();

    res.status(200).json(result);

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
});

// Send bulk notifications
router.post('/notifications/send', async (req, res) => {
  try {

    const { message, type, eventDate, userFilter } = req.body;


    let users: any[];

    if (eventDate) {
      // Get users with bookings for specific event date
      const date = new Date(eventDate);
      const bookings = await BookingModel.find({
        eventDate: {
          $gte: startOfDay(date),
          $lte: endOfDay(date)
        },
        status: { $ne: 'cancelled' }
      }).populate('user');

      users = bookings.map(booking => booking.user).filter(Boolean);
    } else {
      // Get all users or filtered users
      const filter = userFilter || {};
      users = await UserModel.find(filter);
    }

    if (users.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No users found for notification',
        error: 'Empty user list'
      });
      return
    }

    await notificationService.sendBulkNotification(users, message, type);

    res.json({
      success: true,
      message: `Notification sent to ${users.length} users successfully`,
      data: { recipientCount: users.length }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await eventService.getEvents({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });
    res.status(200).json(result);

  } catch (error: any) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
    res.status(500).json(response);
  }
});

// Get event by ID
router.get('/events/:eventId', async (req, res) => {
  try {
    const result = await eventService.getEvent(req.params.eventId);
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

// Create event manually
router.post('/events', async (req, res) => {
  try {
    const { date, time, totalSeats } = req.body;
    const result = await eventService.createEvent({ date, time, totalSeats });
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

// Update event
router.put('/events/:eventId', async (req, res) => {
  try {
    const { time, totalSeats, isActive } = req.body;

    const result = await eventService.updateEvent({ eventId: req.params.eventId, time, totalSeats, isActive });
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

// Delete event
router.delete('/events/:eventId', async (req, res) => {
  try {
    const result = await eventService.deleteEvent(req.params.eventId);
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