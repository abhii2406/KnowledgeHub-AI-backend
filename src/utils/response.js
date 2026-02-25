/**
 * Standard API Response Format
 * Strictly follows: { success, message, data, error }
 */

const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        error: error ? (typeof error === 'string' ? error : error.message || JSON.stringify(error)) : null
    });
};

module.exports = { sendResponse };
