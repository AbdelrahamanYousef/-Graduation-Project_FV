const { Router } = require('express');
const prisma = require('../../lib/prisma');
const { authUser } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();
router.use(authUser);

// Get user profile
router.get('/profile', async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, createdAt: true },
        });
        res.json(user);
    } catch (e) { next(e); }
});

// Update user profile
router.put('/profile', validate({
    body: z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(10).optional(),
    }).partial(),
}), async (req, res, next) => {
    try {
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: req.body,
            select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true },
        });
        res.json(user);
    } catch (e) { next(e); }
});

// Get user's donation history
router.get('/donations', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.donation.findMany({
                where: { userId: req.user.id },
                include: { project: { select: { id: true, title: true } } },
                orderBy: { createdAt: 'desc' },
                skip, take: limit,
            }),
            prisma.donation.count({ where: { userId: req.user.id } }),
        ]);

        res.json({ data, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
    } catch (e) { next(e); }
});

// Get user donation stats
router.get('/stats', async (req, res, next) => {
    try {
        const result = await prisma.donation.aggregate({
            where: { userId: req.user.id, status: 'SUCCESS' },
            _sum: { amount: true },
            _count: { id: true },
            _avg: { amount: true },
        });
        res.json({
            totalDonations: result._sum.amount || 0,
            donationCount: result._count.id || 0,
            averageDonation: result._avg.amount || 0,
        });
    } catch (e) { next(e); }
});

module.exports = router;
