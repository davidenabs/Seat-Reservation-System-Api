import { BookingModel } from "../models/Booking";
import { EventModel } from "../models/Event";
import { ApiResponse, Event } from "../types";
import { endOfDay, startOfDay } from "date-fns";

export class EventService {
    async getEvents({ page = 1, limit = 10 }: { page?: number, limit?: number } = {}): Promise<ApiResponse<Event[]>> {
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            EventModel.find()
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            EventModel.countDocuments()
        ]);
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const bookings = await BookingModel.find({ eventDate: event.date }).lean();
            return {
                ...event,
                totalBookedSeats: bookings.length,
                availableSeats: event.totalSeats - bookings.length
            };
        }));
        return {
            success: true,
            message: 'Events fetched successfully',
            data: eventsWithStats as Event[],
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
        
    }

    async createEvent({ date, time, totalSeats }: { date: Date, time: string, totalSeats: number }): Promise<ApiResponse<Event>> {

        const existingEvent = await EventModel.findOne({
            date: {
                $gte: startOfDay(new Date(date)),
                $lte: endOfDay(new Date(date))
            }
        });

        if (existingEvent) {
            return {
                success: false,
                message: 'Event already exists for this date',
                error: 'Duplicate event'
            };
        }

        const event = new EventModel({
            date: new Date(date),
            time,
            totalSeats,
            availableSeats: totalSeats,
            isActive: true
        });

        await event.save();

        return {
            success: true,
            message: 'Event created successfully',
            data: event as Event
        };
    }

    async updateEvent({ eventId, time, totalSeats, isActive }: { eventId: string, time: string, totalSeats: number, isActive: boolean }): Promise<ApiResponse<Event>> {
        const event = await EventModel.findByIdAndUpdate(eventId, { time, totalSeats, isActive }, { new: true });

        if (!event) {
            return {
                success: false,
                message: 'Event not found',
                error: 'Invalid event ID'
            };
        }

        return {
            success: true,
            message: 'Event updated successfully',
            data: event as Event    
        };
    }

    async deleteEvent(eventId: string): Promise<ApiResponse<Event>> {
        const event = await EventModel.findByIdAndDelete(eventId);
        return {
            success: true,
            message: 'Event deleted successfully',
            data: event as Event
        };
    }

    async getEvent(eventId: string): Promise<ApiResponse<Event>> {
        const event = await EventModel.findById(eventId);
        return {
            success: event ? true : false,
            message: event ? 'Event retrieved successfully' : 'Event not found',
            data: event as Event,
            error: event ? undefined : 'Invalid event ID'
        };
    }
}
