const mongoose = require('mongoose');
 
const MONGODB_URI = 'mongodb+srv://I528974:Jibimax28112002@api-scalability-oss-pro.8dqvajj.mongodb.net/?appName=API-Scalability-OSS-Project';
 
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
 
module.exports = { connectDB, mongoose };