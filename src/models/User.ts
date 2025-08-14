import { Schema, model } from 'mongoose';
import { User } from '@/types/index';

const userSchema = new Schema<User>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    ageRange: {
        type: String,
        required: true,
        enum: ['18-25', '26-35', '36-45', '46-55', '55+']
    }
}, {
    timestamps: true
});

// Only keep index for non-unique field
userSchema.index({ phone: 1 });

export const UserModel = model<User>('User', userSchema);