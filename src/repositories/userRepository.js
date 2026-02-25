const pool = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async findByUsername(username) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    async create(userData) {
        const { username, email, password } = userData;
        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password]
        );
        return result.insertId;
    }

    async findById(id) {
        const [rows] = await pool.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // Token blacklisting
    async blacklistToken(token, expiresAt) {
        await pool.execute('INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)', [token, expiresAt]);
    }

    async isTokenBlacklisted(token) {
        const [rows] = await pool.execute('SELECT token FROM token_blacklist WHERE token = ?', [token]);
        return rows.length > 0;
    }
}

module.exports = new UserRepository();
