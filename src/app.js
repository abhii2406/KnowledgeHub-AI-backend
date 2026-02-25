const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const { sendResponse } = require('./utils/response');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev')); // method url status response-timems
}

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
        error: 'Rate limit exceeded'
    }
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
    sendResponse(res, 200, true, 'Server is running healthily');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

// 404 handler
app.use((req, res) => {
    sendResponse(res, 404, false, 'Route not found');
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
