const service = require('./donations.service');

async function list(req, res, next) {
    try {
        const userId = req.user?.role === 'ADMIN' ? null : req.user?.id;
        res.json(await service.list(req.query, userId));
    } catch (e) { next(e); }
}

async function getById(req, res, next) {
    try { res.json(await service.getById(req.params.id)); } catch (e) { next(e); }
}

async function getStats(req, res, next) {
    try { res.json(await service.getStats()); } catch (e) { next(e); }
}

async function refund(req, res, next) {
    try {
        const result = await service.refund(req.params.id, req.body.reason, req.user);
        res.json(result);
    } catch (e) { next(e); }
}

async function getTypes(req, res) { res.json(service.getTypes()); }
async function getPaymentMethods(req, res) { res.json(service.getPaymentMethods()); }
async function getSuggestedAmounts(req, res) { res.json(service.getSuggestedAmounts()); }

module.exports = { list, getById, getStats, refund, getTypes, getPaymentMethods, getSuggestedAmounts };
