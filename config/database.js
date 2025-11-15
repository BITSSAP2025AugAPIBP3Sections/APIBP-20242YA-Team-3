const mongoose = require('mongoose');

// Add database name to the connection string
const MONGODB_URI = 'mongodb+srv://I528974:Jibimax28112002@api-scalability-oss-pro.8dqvajj.mongodb.net/service-management-api?appName=API-Scalability-OSS-Project';

const connectDB = async () => {
    try {
        // Add connection options for better reliability
        const conn = await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection failed, API will continue without database:', error.message);
        // Don't exit the process - let the API run without MongoDB
        return null;
    }
};

module.exports = { connectDB, mongoose };
