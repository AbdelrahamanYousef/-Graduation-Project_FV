const { Router } = require('express');
const ctrl = require('./dashboard.controller');
const { authAdmin } = require('../../middleware/auth');

const router = Router();
router.use(authAdmin);

router.get('/stats', ctrl.getStats);
router.get('/recent-donations', ctrl.getRecentDonations);
router.get('/projects-summary', ctrl.getProjectsSummary);
router.get('/updates', ctrl.getRecentActivity);

module.exports = router;
