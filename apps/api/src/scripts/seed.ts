import argon2 from 'argon2';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { UserModel } from '../modules/auth/auth.model.js';
import { PostModel, CommentModel } from '../modules/content/content.model.js';
import { ScholarApplicationModel } from '../modules/scholar/scholar.model.js';
import { usernameService } from '../services/bloomFilter.service.js';

export async function seedDatabase() {
  try {
    logger.info('Starting Sanad database seed operation...');
    const connected = await connectDB();
    if (!connected || mongoose.connection.readyState !== 1) {
      logger.error(
        'Database connection could not be established. Please ensure MongoDB is running or specify MONGODB_URI in apps/api/.env (e.g. MongoDB Atlas cluster).'
      );
      process.exit(1);
    }

    const passwordHash = await argon2.hash('SanadSecure2026!');

    // 1. Clear existing collections for a clean idempotent seed
    await UserModel.deleteMany({});
    await PostModel.deleteMany({});
    await CommentModel.deleteMany({});
    await ScholarApplicationModel.deleteMany({});

    // 2. Create Default Admin
    const adminUser = await UserModel.create({
      username: 'khizer',
      email: 'mkhizer@sanad.app',
      displayName: 'System Administrator',
      passwordHash,
      roles: ['admin', 'moderator', 'scholar', 'member'],
      bio: 'Platform administration and high-integrity isnad governance council.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      scholarProfile: {
        verified: true,
        verifiedAt: new Date(),
        institution: 'Sanad Academic Foundation',
        specialties: ['Isnad Verification', 'Governance', 'Digital Hadith Preservation'],
        languages: ['Arabic', 'English', 'Urdu'],
      },
      twoFA: {
        enabled: false,
        backupCodes: [],
      },
      status: 'active',
    });

    // 3. Create Verified Scholar 1: Shaykh Dr. Ahmad al-Azhari
    const scholar1 = await UserModel.create({
      username: 'ahmad_azhari',
      email: 'ahmad@sanad.app',
      displayName: 'Shaykh Dr. Ahmad al-Azhari',
      passwordHash,
      roles: ['scholar', 'member'],
      bio: 'Professor of Hadith and Usul al-Fiqh at Al-Azhar University. Holder of 14 continuous isnad chains.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      scholarProfile: {
        verified: true,
        verifiedAt: new Date(),
        institution: 'Al-Azhar University, Cairo',
        specialties: ['Hadith Sciences', 'Usul al-Fiqh', 'Ilm al-Rijal'],
        languages: ['Arabic', 'English'],
      },
      twoFA: {
        enabled: true,
        backupCodes: [],
      },
      status: 'active',
    });

    // 4. Create Verified Scholar 2: Dr. Fatima al-Zahra
    const scholar2 = await UserModel.create({
      username: 'fatima_zahra',
      email: 'fatima@sanad.app',
      displayName: 'Dr. Fatima al-Zahra',
      passwordHash,
      roles: ['scholar', 'member'],
      bio: 'Senior researcher in Islamic Jurisprudence and contemporary financial ethics. PhD from Al-Qarawiyyin.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      scholarProfile: {
        verified: true,
        verifiedAt: new Date(),
        institution: 'University of al-Qarawiyyin, Fez',
        specialties: ['Islamic Finance', 'Fiqh al-Muamalat', 'Maqasid al-Shariah'],
        languages: ['Arabic', 'English', 'French'],
      },
      twoFA: {
        enabled: true,
        backupCodes: [],
      },
      status: 'active',
    });

    // 5. Create General Member: Tariq Ibn Ziyad
    const member1 = await UserModel.create({
      username: 'tariq_learner',
      email: 'tariq@sanad.app',
      displayName: 'Tariq Ibn Ziyad',
      passwordHash,
      roles: ['member'],
      bio: 'Student of sacred knowledge and classical Arabic grammar.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      twoFA: {
        enabled: false,
        backupCodes: [],
      },
      status: 'active',
    });

    // 6. Seed Educational Posts and Curriculum
    const post1 = await PostModel.create({
      authorId: scholar1._id,
      type: 'reel',
      caption:
        'Foundations of Isnad Methodology: How classical scholars authenticated narrator reliability in Sahih al-Bukhari. Every link in the chain represents verified historical auditory transmission.',
      tags: ['Hadith', 'Isnad', 'Bukhari', 'Methodology'],
      language: 'en',
      visibility: 'public',
      status: 'live',
      counts: {
        likes: 124,
        comments: 18,
        views: 1420,
        shares: 34,
      },
    });

    const post2 = await PostModel.create({
      authorId: scholar2._id,
      type: 'reel',
      caption:
        'Contemporary Islamic Finance: Ethical risk-sharing versus synthetic debt instruments under the Maqasid framework. Understanding classical Qard and Murabaha contracts in digital markets.',
      tags: ['IslamicFinance', 'Fiqh', 'Ethics', 'Maqasid'],
      language: 'en',
      visibility: 'public',
      status: 'live',
      counts: {
        likes: 89,
        comments: 9,
        views: 860,
        shares: 21,
      },
    });

    const post3 = await PostModel.create({
      authorId: adminUser._id,
      type: 'reel',
      caption:
        'Welcome to Sanad: An uncompromised digital haven where only verified scholars publish, upholding the integrity of sacred transmission across the global Ummah.',
      tags: ['Sanad', 'Verification', 'TraditionalKnowledge', 'Authenticity'],
      language: 'en',
      visibility: 'public',
      status: 'live',
      counts: {
        likes: 312,
        comments: 45,
        views: 3400,
        shares: 88,
      },
    });

    // 7. Seed Comments
    await CommentModel.create({
      postId: post1._id,
      userId: scholar2._id,
      text: 'BarakAllahu feekum Shaykh Ahmad. An essential reminder regarding the rigorous conditions of continuous audition (ittisal al-sanad).',
      status: 'active',
    });

    await CommentModel.create({
      postId: post1._id,
      userId: member1._id,
      text: 'Could you recommend the primary preparatory texts on Mustalah al-Hadith for beginning students?',
      status: 'active',
    });

    // 8. Seed Scholar Verification Dossier for Review Queue
    await ScholarApplicationModel.create({
      userId: member1._id,
      statement:
        'Graduate of Darul Uloom with Ijazah in the Six Canonical Books of Hadith under Mufti Muhammad Ibrahim.',
      institution: 'Darul Uloom Classical Studies',
      credentials: [
        {
          type: 'ijazah',
          fileKey: 'credentials/darul-uloom-hadith-ijazah.pdf',
          institution: 'Darul Uloom',
          year: 2024,
        },
      ],
      specialties: ['Hadith Sciences', 'Classical Arabic'],
      languages: ['Arabic', 'Urdu', 'English'],
      status: 'pending',
    });

    // 9. Sync Bloom Filter for username uniqueness
    await usernameService.initialize();

    logger.info('Database seeded successfully:');
    logger.info(`- Users: 4 (1 Admin, 2 Scholars, 1 Member)`);
    logger.info(`- Posts: 3 Educational Curricula`);
    logger.info(`- Comments: 2 Verified Discussions`);
    logger.info(`- Applications: 1 Pending Dossier in Review Queue`);
    logger.info(`- Default credentials: password is "SanadSecure2026!" for all users.`);

    await disconnectDB();
  } catch (error) {
    logger.error({ error }, 'Database seed failed');
    process.exit(1);
  }
}

// Run directly when script is executed
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}

