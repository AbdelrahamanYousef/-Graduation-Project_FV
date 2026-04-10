const service = require('./auth.service');
const { verifyToken } = require('../../lib/jwt');

async function adminLogin(req, res, next) {
    try {
        const result = await service.adminLogin(req.body.email, req.body.password);
        res.json(result);
    } catch (e) { next(e); }
}

async function sendOtp(req, res, next) {
    try { res.json(await service.sendOtp(req.body.phone)); } catch (e) { next(e); }
}

async function verifyOtp(req, res, next) {
    try {
        const result = await service.verifyOtp(req.body.phone, req.body.otp);
        res.json(result);
    } catch (e) { next(e); }
}

async function register(req, res, next) {
    try {
        const result = await service.registerUser(req.user.id, req.body);
        res.json(result);
    } catch (e) { next(e); }
}

async function me(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'No token' });
        const decoded = verifyToken(token);
        const user = await service.getCurrentUser(decoded.id);
        res.json(user);
    } catch (e) { next(e); }
}

async function refresh(req, res, next) {
    try { res.json(await service.refreshTokens(req.body.refreshToken)); } catch (e) { next(e); }
}

async function logout(req, res) {
    res.json({ success: true, message: 'Logged out' });
}

module.exports = { adminLogin, sendOtp, verifyOtp, register, me, refresh, logout };
