import mongoose, { Document, Schema } from 'mongoose';

interface IOTP extends Document {
    email: string;
    otp: string;
    tempId: string;
    expiresAt: Date;
    verified: boolean;
    attempts: number;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    tempId: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export const OTPModel = mongoose.model<IOTP>('OTP', OTPSchema);