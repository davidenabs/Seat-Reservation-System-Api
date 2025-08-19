import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from './environment';
import { logger } from '../utils/logger';
import seedAdmins from '../seed/admin.seed';
import seedSystemSettings from '../seed/settings.seed';

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        logger.info("Connecting to database");
        const conn = await mongoose.connect(config.db.mongodb, {
            autoIndex: true,
        });
        mongoose.set('strictQuery', false);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        logger.info('Info: MongoDB connection successful:', conn.connection.name);
        
        // Run all seeders
        await runSeeders();
        
    } catch (err) {
        logger.error('Error: Failed to connect MongoDB:', err);
        throw err;
    }
};

const runSeeders = async (): Promise<void> => {
    try {
        logger.info("Starting database seeding...");
        
        // Run admin seeder
        const adminResult = await seedAdmins();
        logger.info("Admin seeder result:", adminResult);
        
        // Run system settings seeder
        const settingsResult = await seedSystemSettings();
        logger.info("System settings seeder result:", settingsResult);
        
        logger.info("Database seeding completed successfully");
    } catch (error) {
        logger.error("Error during database seeding:", error);
        // Don't throw error here to prevent server from crashing
        // Seeders are optional and shouldn't prevent the app from starting
    }
};

export default connectDB;