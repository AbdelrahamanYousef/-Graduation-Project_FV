const { Router } = require('express');
const ctrl = require('./donations.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

// Public reference endpoints
router.get('/types', ctrl.getTypes);
router.get('/payment-methods', ctrl.getPaymentMethods);
router.get('/amounts', ctrl.getSuggestedAmounts);

// Admin endpoints
router.get('/', authAdmin, ctrl.list);
router.get('/stats', authAdmin, ctrl.getStats);
router.get('/:id', authAdmin, ctrl.getById);

// Admin refund endpoint (Part 3)
router.post('/:id/refund', authAdmin, validate({
    body: z.object({
        reason: z.string().min(2, 'Refund reason is required'),
    }),
}), ctrl.refund);

module.exports = router;
