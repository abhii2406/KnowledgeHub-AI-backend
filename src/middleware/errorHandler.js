const { sendResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    // Log error for internal monitoring
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[ERROR] ${req.method} ${req.url}:`, err.stack);
    } else {
        console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);
    }

    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // In production, don't leak sensitive error details
    const errorDetail = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Something went wrong on our side'
        : err.message;

    return sendResponse(res, statusCode, false, message, null, errorDetail);
};

module.exports = errorHandler;
