import { NotFoundError } from "../middleware/errorHandler";
import { SystemSettingsModel } from "../models/SystemSettings";
import { ApiResponse } from "../types";


export async function getSystemSettings(): Promise<any> {
    const settings = await SystemSettingsModel.findOne();

    if (!settings) {
        throw new NotFoundError('System settings not configured');
    }

    return settings;
}

export class SettingsService {
    async getSettings(): Promise<ApiResponse<any>> {
        const settings = await getSystemSettings();
        return {
            success: true,
            message: 'Settings retrieved successfully',
            data: settings
        };
    }

    async updateSettings(settings: any): Promise<ApiResponse<any>> {
        const updatedSettings = await SystemSettingsModel.findOneAndUpdate({}, settings, { new: true });

        if (!updatedSettings) {
            throw new NotFoundError('Settings not found');
        }

        return {
            success: true,
            message: 'Settings updated successfully',
            data: updatedSettings
        };
    }
}