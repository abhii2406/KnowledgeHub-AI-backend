const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { sendResponse } = require('../utils/response');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendResponse(res, 401, false, 'Authorization token required');
        }

        const token = authHeader.split(' ')[1];

        // Check blacklist
        const isBlacklisted = await userRepository.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return sendResponse(res, 401, false, 'Token is invalidated. Please login again.');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.token = token; // Store token for logout if needed
        next();
    } catch (error) {
        return sendResponse(res, 401, false, 'Invalid or expired token');
    }
};

module.exports = authMiddleware;
