const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../lib/jwt');
const config = require('../../config');
const ApiError = require('../../shared/ApiError');

/**
 * Admin login with email + password
 */
async function adminLogin(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
        throw ApiError.unauthorized('Invalid email or password');
    }
    if (user.role !== 'ADMIN') {
        throw ApiError.unauthorized('Admin access required');
    }
    if (user.status !== 'ACTIVE') {
        throw ApiError.unauthorized('Account is inactive');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const payload = { id: user.id, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        token,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
}

/**
 * Send OTP to user phone (demo mode — always succeeds)
 */
async function sendOtp(phone) {
    return { success: true, message: 'OTP sent successfully' };
}

/**
 * Verify OTP and return token
 */
async function verifyOtp(phone, otp) {
    if (otp !== config.demoOtp) {
        throw ApiError.badRequest('Invalid OTP');
    }

    let user = await prisma.user.findFirst({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
        // Create a new USER-role account for the phone number
        user = await prisma.user.create({
            data: {
                phone,
                name: phone, // placeholder until registration
                email: `${phone}@placeholder.local`,
                passwordHash: '', // OTP-only user, no password
                role: 'USER',
            },
        });
    }

    const payload = { id: user.id, role: user.role };
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        token,
        refreshToken,
        user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role },
        isNewUser,
    };
}

/**
 * Complete user registration (name, email)
 */
async function registerUser(userId, data) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            email: data.email || undefined,
        },
    });
    return { id: user.id, name: user.name, phone: user.phone, email: user.email };
}

/**
 * Get current user from token
 */
async function getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, role: true, status: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw ApiError.notFound('User not found');
    return user;
}

/**
 * Refresh token
 */
async function refreshTokens(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const payload = { id: decoded.id, role: decoded.role };
    return {
        token: generateToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

module.exports = { adminLogin, sendOtp, verifyOtp, registerUser, getCurrentUser, refreshTokens };
