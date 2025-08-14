import mongoose, { Schema, model } from 'mongoose';
import { Booking, BookingStatus } from '@/types/index';

const bookingSchema = new Schema<Booking>({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Event'
  },
  eventDate: {
    type: Date,
    required: true
  },
  seatNumbers: [{
    type: Number,
    required: true
  }],
  seatLabels: [{
    type: String,
    required: true
  }],
  calendarLink: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: BookingStatus,
    default: BookingStatus.Attending
  },
  qrCode: {
    type: String,
    required: true
  },
  reservationToken: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Only keep indexes for non-unique fields
bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ eventDate: 1 });

export const BookingModel = model<Booking>('Booking', bookingSchema);