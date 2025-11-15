const fs = require('fs');
const path = require('path');
const { connectDB } = require('./config/database');
const { Category } = require('./models/Service');
const { Bill } = require('./models/Bill');
const { Tenant } = require('./models/Tenant');
const { Notification } = require('./models/Notification');

const migrateData = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB for data migration...');

        // Clear existing data
        await Category.deleteMany({});
        await Bill.deleteMany({});
        await Tenant.deleteMany({});
        await Notification.deleteMany({});
        console.log('Cleared existing data...');

        // Migrate Services
        const servicesPath = path.join(__dirname, 'Services.json');
        if (fs.existsSync(servicesPath)) {
            const servicesData = fs.readFileSync(servicesPath, 'utf8');
            const servicesJson = JSON.parse(servicesData);
            await Category.insertMany(servicesJson.services);
            console.log(`Successfully migrated ${servicesJson.services.length} categories to MongoDB`);
        }

        // Migrate Bills
        const billsPath = path.join(__dirname, 'bills.json');
        if (fs.existsSync(billsPath)) {
            const billsData = fs.readFileSync(billsPath, 'utf8');
            const bills = JSON.parse(billsData);
            await Bill.insertMany(bills);
            console.log(`Successfully migrated ${bills.length} bills to MongoDB`);
        }

        // Migrate Tenants
        const tenantsPath = path.join(__dirname, 'tenants.json');
        if (fs.existsSync(tenantsPath)) {
            const tenantsData = fs.readFileSync(tenantsPath, 'utf8');
            const tenants = JSON.parse(tenantsData);
            await Tenant.insertMany(tenants);
            console.log(`Successfully migrated ${tenants.length} tenants to MongoDB`);
        }

        // Migrate Notifications
        const notificationsPath = path.join(__dirname, 'notifications.json');
        if (fs.existsSync(notificationsPath)) {
            const notificationsData = fs.readFileSync(notificationsPath, 'utf8');
            const notificationsJson = JSON.parse(notificationsData);
            if (notificationsJson.notifications && notificationsJson.notifications.length > 0) {
                await Notification.insertMany(notificationsJson.notifications);
                console.log(`Successfully migrated ${notificationsJson.notifications.length} notifications to MongoDB`);
            }
        }

        // Verify the migration
        const categoriesCount = await Category.countDocuments();
        const billsCount = await Bill.countDocuments();
        const tenantsCount = await Tenant.countDocuments();
        const notificationsCount = await Notification.countDocuments();
        
        console.log('\n=== Migration Summary ===');
        console.log(`Categories in database: ${categoriesCount}`);
        console.log(`Bills in database: ${billsCount}`);
        console.log(`Tenants in database: ${tenantsCount}`);
        console.log(`Notifications in database: ${notificationsCount}`);
        console.log('========================');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

// Run migration if this script is executed directly
if (require.main === module) {
    migrateData();
}

module.exports = migrateData;
