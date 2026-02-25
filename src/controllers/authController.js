const authService = require('../services/authService');
const { sendResponse } = require('../utils/response');

class AuthController {
    async signup(req, res, next) {
        try {
            const { username, email, password } = req.body;
            const userId = await authService.signup({ username, email, password });
            return sendResponse(res, 201, true, 'User registered successfully', { userId });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const loginData = await authService.login(email, password);
            return sendResponse(res, 200, true, 'Login successful', loginData);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const token = req.token;
            await authService.logout(token);
            return sendResponse(res, 200, true, 'Logged out successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
