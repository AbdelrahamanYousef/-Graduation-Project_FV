const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    const where = { deletedAt: null };
    if (query.status) where.status = query.status;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.beneficiary.findMany({
            where, skip, take: limit,
            include: { program: { select: { id: true, name: true } }, _count: { select: { disbursements: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.beneficiary.count({ where }),
    ]);

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const b = await prisma.beneficiary.findFirst({
        where: { id, deletedAt: null },
        include: { program: true, disbursements: { take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!b) throw ApiError.notFound('Beneficiary not found');
    return b;
}

async function create(data) {
    return prisma.beneficiary.create({ data, include: { program: { select: { id: true, name: true } } } });
}

async function update(id, data) {
    await getById(id);
    return prisma.beneficiary.update({ where: { id }, data });
}

async function remove(id) {
    await getById(id);
    return prisma.beneficiary.update({ where: { id }, data: { deletedAt: new Date() } });
}

async function getStats() {
    const [total, active, pending] = await Promise.all([
        prisma.beneficiary.count({ where: { deletedAt: null } }),
        prisma.beneficiary.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.beneficiary.count({ where: { status: 'PENDING', deletedAt: null } }),
    ]);
    const avg = await prisma.beneficiary.aggregate({
        where: { deletedAt: null, monthlyAid: { not: null } },
        _avg: { monthlyAid: true },
    });
    return { total, active, pending, avgMonthlyAid: avg._avg.monthlyAid || 0 };
}

module.exports = { list, getById, create, update, remove, getStats };
