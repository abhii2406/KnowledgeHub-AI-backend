const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { sendResponse } = require('../utils/response');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetails = errors.array().map(err => ({
            field: err.param || err.path,
            message: err.msg
        }));
        return sendResponse(res, 400, false, 'Validation failed', null, errorDetails);
    }
    next();
};

const articleValidation = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content')
        .trim()
        .isLength({ min: 50 }).withMessage('Content must be at least 50 characters long to ensure quality knowledge sharing')
        .isLength({ max: 50000 }).withMessage('Content is too long (max 50,000 characters)'),
    body('category')
        .isIn(['Tech', 'AI', 'Backend', 'Frontend', 'DevOps'])
        .withMessage('Category must be one of: Tech, AI, Backend, Frontend, DevOps'),
    validate
];

// Public routes
router.get('/', articleController.getAll);
router.get('/:id', articleController.getById);

// Protected routes
router.post('/', authMiddleware, articleValidation, articleController.create);
router.put('/:id', authMiddleware, articleValidation, articleController.update);
router.delete('/:id', authMiddleware, articleController.delete);
router.get('/my/all', authMiddleware, articleController.getMy);

// AI suggestion route
router.post('/ai/suggest', authMiddleware, [
    body('content').isLength({ min: 20 }).withMessage('Provide atleast 20 chars for better AI suggestions'),
    validate
], articleController.getAISuggestions);

module.exports = router;
