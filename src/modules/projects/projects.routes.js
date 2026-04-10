const { Router } = require('express');
const ctrl = require('./projects.controller');
const { authAdmin } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const router = Router();

const projectSchema = z.object({
    programId: z.string().min(1),
    title: z.string().min(2),
    description: z.string().optional(),
    goal: z.number().positive(),
    location: z.string().optional(),
    imageUrl: z.string().optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'PENDING']).optional(),
});

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authAdmin, validate({ body: projectSchema }), ctrl.create);
router.put('/:id', authAdmin, validate({ body: projectSchema.partial() }), ctrl.update);
router.delete('/:id', authAdmin, ctrl.remove);

module.exports = router;
