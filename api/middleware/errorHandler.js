/**
 * ===== ERROR HANDLER MIDDLEWARE =====
 * Centralized error handling for the API
 */

const errorHandler = (err, req, res, next) => {
    // Log error
    console.error('Error:', err);
    
    // Default error status and message
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Send error response
    res.status(status).json({
        success: false,
        error: message,
        // Include stack trace in development mode
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;

