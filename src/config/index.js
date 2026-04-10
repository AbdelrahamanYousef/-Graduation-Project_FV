require('dotenv').config();

module.exports = {
    port: parseInt(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    demoOtp: process.env.DEMO_OTP || '123456',
    upload: {
        dir: process.env.UPLOAD_DIR || 'uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
