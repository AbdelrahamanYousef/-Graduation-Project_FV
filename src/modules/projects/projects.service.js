const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');

async function list(query = {}) {
    const where = { deletedAt: null };
    if (query.programId) where.programId = query.programId;
    if (query.status) where.status = query.status;
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.project.findMany({
            where, skip, take: limit,
            include: { program: { select: { id: true, name: true, icon: true, color: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.project.count({ where }),
    ]);

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
}

async function getById(id) {
    const project = await prisma.project.findFirst({
        where: { id, deletedAt: null },
        include: { program: true, donations: { take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, fullName: true, isAnonymous: true, createdAt: true } } },
    });
    if (!project) throw ApiError.notFound('Project not found');
    return project;
}

async function create(data) {
    return prisma.project.create({ data, include: { program: { select: { id: true, name: true } } } });
}

async function update(id, data) {
    await getById(id);
    return prisma.project.update({ where: { id }, data, include: { program: { select: { id: true, name: true } } } });
}

async function remove(id) {
    await getById(id);
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
}

module.exports = { list, getById, create, update, remove };
