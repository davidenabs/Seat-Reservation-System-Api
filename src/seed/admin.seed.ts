import { AdminModel } from "@/models/Admin";
import { logger } from "@/utils/logger";
import bcrypt from 'bcryptjs';

export default async function seedAdmins() {
    const salt = await bcrypt.genSalt(12);
    try {

        // Default admin data
        const adminData = [{
            username: "superadmin",
            email: "superadmin@company.com",
            password: await bcrypt.hash("Admin@123", salt), // This will be hashed by the pre-save hook
            role: "superadmin"
        }, {
            username: "admin",
            email: "admin@company.com",
            password: await bcrypt.hash("Admin@123", salt), // This will be hashed by the pre-save hook
            role: "admin"
        }];

        // Create admin users (only if they don't exist)
        const adminWriteOps = adminData.map(admin => ({
            updateOne: {
                filter: {
                    $or: [
                        { email: admin.email },
                        { username: admin.username }
                    ]
                },
                update: {
                    $setOnInsert: admin // Only set these values if creating new document
                },
                upsert: true
            }
        }));

        const result = await AdminModel.bulkWrite(adminWriteOps);

        return `Admin seeding successful - Created: ${result.upsertedCount}, Modified: ${result.modifiedCount}`;
    } catch (error) {
        logger.error('Admin seeding error:', error);
        return error;
    }
}