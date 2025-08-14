import { SystemSettingsModel } from "@/models/SystemSettings";
import { logger } from "@/utils/logger";

export default async function seedSystemSettings() {
    try {
        // Default system settings data
        const defaultSettings = {
            reservationOpenDate: new Date('2024-01-01T00:00:00Z'),
            reservationCloseDate: new Date('2024-12-31T23:59:59Z'),
            defaultTotalSeats: 80,
            eventTimes: [
                "09:00 AM",
                "12:00 PM", 
                "03:00 PM",
                "06:00 PM"
            ],
            workingDays: [1, 2, 3, 4, 5], // Monday to Friday
            maxSeatsPerUser: 2
        };

        // Check if system settings already exist
        const existingSettings = await SystemSettingsModel.findOne();
        
        if (!existingSettings) {
            await SystemSettingsModel.create(defaultSettings);
            return "System Settings seeding successful - New settings created";
        } else {
            return "System Settings already exist - Skipping creation";
        }
    } catch (error) {
        logger.error('System Settings seeding error:', error);
        return error;
    }
}