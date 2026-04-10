const prisma = require('../../lib/prisma');

async function getStats() {
    const [revenue, activeProjects, pendingCases, monthlyDonations] = await Promise.all([
        prisma.donation.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
        prisma.project.count({ where: { status: 'ACTIVE', deletedAt: null } }),
        prisma.beneficiary.count({ where: { status: 'PENDING', deletedAt: null } }),
        prisma.donation.aggregate({
            where: {
                status: 'SUCCESS',
                createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
            },
            _sum: { amount: true },
            _count: { id: true },
        }),
    ]);

    return {
        totalRevenue: revenue._sum.amount || 0,
        activeProjects,
        pendingCases,
        monthlyDonations: monthlyDonations._sum.amount || 0,
        monthlyDonationCount: monthlyDonations._count.id || 0,
    };
}

async function getRecentDonations(limit = 10) {
    return prisma.donation.findMany({
        where: { status: 'SUCCESS' },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, amount: true, fullName: true, isAnonymous: true, type: true, createdAt: true, project: { select: { title: true } } },
    });
}

async function getProjectsSummary() {
    return prisma.project.findMany({
        where: { deletedAt: null, status: 'ACTIVE' },
        select: { id: true, title: true, goal: true, raised: true, donorsCount: true, program: { select: { name: true, color: true } } },
        orderBy: { raised: 'desc' },
        take: 10,
    });
}

async function getRecentActivity(limit = 10) {
    const [donations, disbursements] = await Promise.all([
        prisma.donation.findMany({ where: { status: 'SUCCESS' }, take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, fullName: true, createdAt: true, type: true } }),
        prisma.disbursement.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { beneficiary: { select: { name: true } } } }),
    ]);

    const activities = [
        ...donations.map(d => ({ type: 'donation', title: `تبرع جديد: ${d.fullName || 'متبرع مجهول'}`, amount: d.amount, date: d.createdAt })),
        ...disbursements.map(d => ({ type: 'disbursement', title: `صرف لـ ${d.beneficiary.name}`, amount: d.amount, date: d.createdAt, status: d.status })),
    ].sort((a, b) => b.date - a.date).slice(0, limit);

    return activities;
}

module.exports = { getStats, getRecentDonations, getProjectsSummary, getRecentActivity };
