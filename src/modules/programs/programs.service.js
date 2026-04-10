const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    const where = { deletedAt: null };
    if (query.status) where.status = query.status;

    return prisma.program.findMany({
        where,
        include: { _count: { select: { projects: true, beneficiaries: true } } },
        orderBy: { createdAt: 'asc' },
    });
}

async function getById(id) {
    const program = await prisma.program.findFirst({ where: { id, deletedAt: null }, include: { _count: { select: { projects: true, beneficiaries: true } } } });
    if (!program) throw ApiError.notFound('Program not found');
    return program;
}

async function create(data) {
    return prisma.program.create({ data });
}

async function update(id, data) {
    await getById(id);
    return prisma.program.update({ where: { id }, data });
}

async function remove(id) {
    await getById(id);
    return prisma.program.update({ where: { id }, data: { deletedAt: new Date() } });
}

module.exports = { list, getById, create, update, remove };
