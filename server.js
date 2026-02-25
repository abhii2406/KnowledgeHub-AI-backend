const app = require('./src/app');
const pool = require('./src/config/db');
require('dotenv').config();

// Environment Variable Validation
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
    console.error(`[CRITICAL] Missing required environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`[INFO] Server is running on port ${PORT}`);
    console.log(`[INFO] AI Mode: ${process.env.AI_MODE || 'mock'}`);
    console.log('[INFO] KnowledgeHub AI Backend Ready');
});

// Graceful Shutdown
const shutdown = () => {
    console.log('\n[INFO] Gracefully shutting down...');
    server.close(async () => {
        console.log('[INFO] HTTP server closed.');
        try {
            await pool.end();
            console.log('[INFO] Database pool closed.');
            process.exit(0);
        } catch (err) {
            console.error('[ERROR] Error closing database pool:', err);
            process.exit(1);
        }
    });

    // Force shutdown if taking too long
    setTimeout(() => {
        console.error('[WARNING] Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
    // Optional: Shutdown on critical unhandled rejection
});
