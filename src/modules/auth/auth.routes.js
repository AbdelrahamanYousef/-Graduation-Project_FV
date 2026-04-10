const { Router } = require('express');
const controller = require('./auth.controller');
const { authUser } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Admin login
router.post('/admin/login', validate({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(1),
    }),
}), controller.adminLogin);

// User OTP flow
router.post('/send-otp', validate({
    body: z.object({ phone: z.string().min(10).max(15) }),
}), controller.sendOtp);

router.post('/verify-otp', validate({
    body: z.object({
        phone: z.string().min(10).max(15),
        otp: z.string().length(6),
    }),
}), controller.verifyOtp);

// Complete user registration (requires auth)
router.post('/register', authUser, validate({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email().optional(),
    }),
}), controller.register);

// Get current user
router.get('/me', controller.me);

// Refresh token
router.post('/refresh', validate({
    body: z.object({ refreshToken: z.string().min(1) }),
}), controller.refresh);

// Logout
router.post('/logout', controller.logout);

module.exports = router;
