/**
 * ===== APEH-BE-CHARITY API SERVER =====
 * Main server file for handling payments, forms, and email services
 * Payment Gateways: Flutterwave & Paystack
 * Email Service: Brevo (Sendinblue)
 * Database: MongoDB
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

// Import routes
const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');
const brevoRoutes = require('./routes/brevo');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Security middleware - protects against common vulnerabilities
app.use(helmet());

// CORS configuration - allows frontend to communicate with backend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://apeh-be-charity.onrender.com',
    credentials: true
}));

// Body parsing middleware - parses JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware - logs HTTP requests in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health check endpoint - used to verify server is running
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        message: 'APEH-BE-CHARITY API is running'
    });
});

// API routes
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/brevo', brevoRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Connect to MongoDB database
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 APEH-BE-CHARITY API Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'https://apeh-be-charity.onrender.com'}`);
    console.log(`💳 Payment Gateways: Flutterwave & Paystack`);
    console.log(`📧 Email Service: Brevo`);
});

module.exports = app;

