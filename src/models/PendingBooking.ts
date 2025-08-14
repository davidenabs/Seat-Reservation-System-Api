import mongoose, { Document, Schema } from 'mongoose';
import { BookingRequest } from '@/types/index';

interface IPendingBooking extends Document {
    tempId: string;
    email: string;
    bookingData: BookingRequest;
    createdAt: Date;
    expiresAt: Date;
}

const PendingBookingSchema = new Schema<IPendingBooking>({
    tempId: { type: String, required: true, unique: true },
    email: { type: String, required: true, index: true },
    bookingData: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        gender: { type: String, required: true },
        ageRange: { type: String, required: true },
        eventDate: { type: String, required: true },
        seatLabels: [{ type: String, required: true }]
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // Automatic cleanup
    }
});

// Compound index for efficient queries
PendingBookingSchema.index({ email: 1, tempId: 1 });
// PendingBookingSchema.index({ expiresAt: 1 }); // For cleanup queries

export const PendingBookingModel = mongoose.model<IPendingBooking>('PendingBooking', PendingBookingSchema);