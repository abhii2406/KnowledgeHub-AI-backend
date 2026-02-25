const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
require('dotenv').config();

class AuthService {
    async signup(userData) {
        const existingEmail = await userRepository.findByEmail(userData.email);
        if (existingEmail) throw new Error('Email already in use');

        const existingUser = await userRepository.findByUsername(userData.username);
        if (existingUser) throw new Error('Username already taken');

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userId = await userRepository.create({
            ...userData,
            password: hashedPassword
        });

        return userId;
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error('Invalid credentials');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    async logout(token) {
        // Decode token to get expiry
        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);
        await userRepository.blacklistToken(token, expiresAt);
    }
}

module.exports = new AuthService();
