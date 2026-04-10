const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ─── Admin Users ──────────────────────────────────
    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@nour.org' },
        update: {},
        create: {
            name: 'أحمد محمد',
            email: 'admin@nour.org',
            passwordHash,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log(`✅ Admin user: ${admin.email} / admin123`);

    const admin2 = await prisma.user.upsert({
        where: { email: 'sara@nour.org' },
        update: {},
        create: {
            name: 'سارة أحمد',
            email: 'sara@nour.org',
            passwordHash: await bcrypt.hash('admin123', 10),
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });

    // ─── Regular User (donor) ────────────────────────
    const donor = await prisma.user.upsert({
        where: { email: 'donor@example.com' },
        update: {},
        create: {
            name: 'محمد علي',
            email: 'donor@example.com',
            phone: '01012345678',
            passwordHash: '', // OTP user, no password
            role: 'USER',
            status: 'ACTIVE',
        },
    });
    console.log(`✅ Donor user: phone 01012345678 / OTP: 123456`);

    // ─── Programs ─────────────────────────────────────
    const programs = await Promise.all([
        prisma.program.create({ data: { name: 'رعاية الأيتام', icon: 'fa-solid fa-children', color: '#FF6B6B', description: 'نوفر الرعاية الشاملة للأيتام من تعليم وصحة ومعيشة كريمة', status: 'ACTIVE' } }),
        prisma.program.create({ data: { name: 'الرعاية الصحية', icon: 'fa-solid fa-heart-pulse', color: '#4ECDC4', description: 'نقدم خدمات طبية مجانية وقوافل علاجية للمناطق المحرومة', status: 'ACTIVE' } }),
        prisma.program.create({ data: { name: 'التعليم', icon: 'fa-solid fa-graduation-cap', color: '#45B7D1', description: 'ندعم العملية التعليمية وتوفير المنح الدراسية', status: 'ACTIVE' } }),
        prisma.program.create({ data: { name: 'الإغاثة العاجلة', icon: 'fa-solid fa-truck-medical', color: '#F7DC6F', description: 'نستجيب للأزمات بتوفير المساعدات العاجلة', status: 'ACTIVE' } }),
        prisma.program.create({ data: { name: 'التنمية المجتمعية', icon: 'fa-solid fa-people-roof', color: '#82E0AA', description: 'تنمية شاملة لتحسين مستوى المعيشة', status: 'ACTIVE' } }),
        prisma.program.create({ data: { name: 'المواسم والأعياد', icon: 'fa-solid fa-moon', color: '#BB8FCE', description: 'مشاريع موسمية في رمضان والأعياد', status: 'ACTIVE' } }),
    ]);
    console.log(`✅ Created ${programs.length} programs`);

    // ─── Projects ─────────────────────────────────────
    const projects = await Promise.all([
        prisma.project.create({ data: { programId: programs[0].id, title: 'كفالة 100 يتيم', description: 'توفير كفالة شهرية شاملة لـ 100 يتيم', goal: 500000, raised: 320000, donorsCount: 180, location: 'القاهرة', status: 'ACTIVE' } }),
        prisma.project.create({ data: { programId: programs[1].id, title: 'قافلة طبية - الصعيد', description: 'قوافل طبية مجانية لمحافظات الصعيد', goal: 200000, raised: 150000, donorsCount: 95, location: 'سوهاج', status: 'ACTIVE' } }),
        prisma.project.create({ data: { programId: programs[2].id, title: 'منح دراسية للمتفوقين', description: 'منح دراسية للطلاب المتفوقين من الأسر المحتاجة', goal: 300000, raised: 180000, donorsCount: 120, location: 'عموم مصر', status: 'ACTIVE' } }),
        prisma.project.create({ data: { programId: programs[3].id, title: 'إغاثة أهل غزة', description: 'توفير مساعدات غذائية وطبية عاجلة', goal: 1000000, raised: 850000, donorsCount: 500, location: 'غزة', status: 'ACTIVE' } }),
        prisma.project.create({ data: { programId: programs[3].id, title: 'إغاثة السودان', description: 'مساعدات إنسانية للمتضررين', goal: 500000, raised: 200000, donorsCount: 150, location: 'السودان', status: 'ACTIVE' } }),
        prisma.project.create({ data: { programId: programs[4].id, title: 'مشروع المياه النظيفة', description: 'حفر آبار وتوفير مياه نظيفة للقرى', goal: 400000, raised: 280000, donorsCount: 200, location: 'المنيا', status: 'ACTIVE' } }),
        prisma.project.create({ data: { programId: programs[5].id, title: 'كسوة العيد', description: 'توفير ملابس العيد للأطفال المحتاجين', goal: 150000, raised: 150000, donorsCount: 300, location: 'عموم مصر', status: 'COMPLETED' } }),
    ]);
    console.log(`✅ Created ${projects.length} projects`);

    // ─── Donations (SUCCESS status) ───────────────────
    const donationData = [
        { userId: donor.id, projectId: projects[0].id, amount: 5000, type: 'ORPHAN_SPONSORSHIP', paymentMethod: 'CARD', status: 'SUCCESS', paidAt: new Date(), fullName: 'محمد علي', phone: '01012345678', receiptNumber: 'NUR-001', walletPhone: '01012345678', simulatedPaymentId: 'SIM-SEED-001' },
        { userId: donor.id, projectId: projects[3].id, amount: 10000, type: 'SADAQAH', paymentMethod: 'VODAFONE_CASH', status: 'SUCCESS', paidAt: new Date(), fullName: 'محمد علي', phone: '01012345678', receiptNumber: 'NUR-002', walletPhone: '01012345678', simulatedPaymentId: 'SIM-SEED-002' },
        { projectId: projects[1].id, amount: 2000, type: 'SADAQAH', paymentMethod: 'FAWRY', status: 'SUCCESS', paidAt: new Date(), isAnonymous: true, fullName: 'متبرع مجهول', receiptNumber: 'NUR-003', simulatedPaymentId: 'SIM-SEED-003' },
        { userId: donor.id, projectId: projects[2].id, amount: 500, type: 'ZAKAT', paymentMethod: 'INSTAPAY', status: 'PENDING', fullName: 'محمد علي', phone: '01012345678', receiptNumber: 'NUR-004', simulatedPaymentId: 'SIM-SEED-004' },
        { projectId: projects[4].id, amount: 1000, type: 'SADAQAH_JARIYAH', paymentMethod: 'BANK_TRANSFER', status: 'SUCCESS', paidAt: new Date(), fullName: 'أحمد خالد', phone: '01098765432', receiptNumber: 'NUR-005', simulatedPaymentId: 'SIM-SEED-005' },
    ];

    for (const d of donationData) {
        await prisma.donation.create({ data: d });
    }
    console.log(`✅ Created ${donationData.length} donations`);

    // ─── Beneficiaries ────────────────────────────────
    const beneficiaries = await Promise.all([
        prisma.beneficiary.create({ data: { name: 'عائلة محمد أحمد', type: 'FAMILY', phone: '01112223333', nationalId: '29001010123456', governorate: 'القاهرة', programId: programs[0].id, status: 'ACTIVE', monthlyAid: 2500, membersCount: 5 } }),
        prisma.beneficiary.create({ data: { name: 'فاطمة حسن', type: 'INDIVIDUAL', phone: '01223334444', nationalId: '29501020654321', governorate: 'الجيزة', programId: programs[1].id, status: 'ACTIVE', monthlyAid: 1500 } }),
        prisma.beneficiary.create({ data: { name: 'عائلة عبد الرحمن', type: 'FAMILY', phone: '01334445555', nationalId: '28801030789012', governorate: 'سوهاج', programId: programs[0].id, status: 'PENDING', monthlyAid: 2000, membersCount: 7 } }),
    ]);
    console.log(`✅ Created ${beneficiaries.length} beneficiaries`);

    // ─── Disbursements ────────────────────────────────
    await prisma.disbursement.create({ data: { beneficiaryId: beneficiaries[0].id, amount: 2500, type: 'دعم شهري', status: 'COMPLETED', approvedById: admin.id } });
    await prisma.disbursement.create({ data: { beneficiaryId: beneficiaries[1].id, amount: 1500, type: 'علاج طبي', status: 'PENDING' } });
    await prisma.disbursement.create({ data: { beneficiaryId: beneficiaries[2].id, amount: 2000, type: 'دعم شهري', status: 'APPROVED', approvedById: admin.id } });
    console.log('✅ Created 3 disbursements');

    // ─── Audit Logs ───────────────────────────────────
    await prisma.auditLog.createMany({
        data: [
            { actorId: admin.id, actorRole: 'ADMIN', action: 'SEED_DATABASE', entity: 'System', entityId: 'seed', payload: { seedVersion: '2.0' } },
            { actorId: donor.id, actorRole: 'USER', action: 'DONATION_CREATED', entity: 'Donation', entityId: 'seed', payload: { amount: 5000 } },
        ],
    });
    console.log('✅ Created sample audit logs');

    // ─── Org Settings ─────────────────────────────────
    await prisma.orgSettings.upsert({
        where: { id: 'singleton' },
        update: {},
        create: { id: 'singleton' },
    });
    console.log('✅ Org settings initialized');

    console.log('\n🎉 Seed completed successfully!');
    console.log('   Admin login: admin@nour.org / admin123');
    console.log('   Donor login: 01012345678 / OTP: 123456');
}

main()
    .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
