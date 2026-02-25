const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { sendResponse } = require('../utils/response');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Structured validation errors
        const errorDetails = errors.array().map(err => ({
            field: err.param || err.path,
            message: err.msg
        }));
        return sendResponse(res, 400, false, 'Validation failed', null, errorDetails);
    }
    next();
};

const signupValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain alphanumeric characters and underscores'),
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
