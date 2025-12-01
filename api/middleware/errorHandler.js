const errorHandler = (err, req, res, next) => {
    console.error('CRITICAL BACKEND ERROR CAUGHT BY HANDLER:', err);
    res.status(500).json({
        success: false,
        error: 'An internal server error occurred.'
    });
};
module.exports = errorHandler;
