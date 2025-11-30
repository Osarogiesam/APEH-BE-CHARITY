/**
 * ===== DATABASE CONNECTION =====
 * MongoDB connection configuration using Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses connection string from environment variables
 */
const connectDB = async () => {
    try {
        // MongoDB connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        // Exit process if database connection fails
        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB error: ${err.message}`);
});

module.exports = connectDB;

