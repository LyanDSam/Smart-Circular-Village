/**
 * Smart Circular Village (SCV) — Admin Bootstrap Script
 *
 * Purpose: Create the first System Administrator account.
 * This script is intended for DEVELOPMENT use only.
 *
 * It will:
 *   1. Initialize Firebase with project credentials from .env
 *   2. Check if an admin account already exists in Firestore
 *   3. If not, create a Firebase Auth account + Firestore user document
 *   4. Abort safely if an admin already exists
 *
 * Usage:
 *   node scripts/bootstrapAdmin.js
 *
 * SECURITY:
 *   - Do NOT commit this script with production credentials.
 *   - Change the default password immediately after first login.
 *   - In production, use Firebase Admin SDK with a service account instead.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Load .env manually (no dotenv dependency required) ───
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      vars[key] = value;
    }
    return vars;
  } catch {
    console.error('❌ Could not read .env file at:', filePath);
    process.exit(1);
  }
}

const env = loadEnv(envPath);

// ─── Configuration ───
const ADMIN_EMAIL = 'admin@scv.local';
const ADMIN_PASSWORD = 'Admin@SCV2026!';
const ADMIN_FULL_NAME = 'System Administrator';
const ADMIN_MEMBER_ID = 'SCV-ADMIN-0001';

// ─── Firebase Init ───
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing. Check your .env file.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const authInstance = getAuth(app);
const db = getFirestore(app);

// ─── Main Bootstrap Logic ───
async function bootstrap() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Smart Circular Village — Admin Bootstrap       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📋 Firebase Project: ${firebaseConfig.projectId}`);
  console.log(`📧 Admin Email:      ${ADMIN_EMAIL}`);
  console.log('');

  // Step 1: Check if any admin already exists in Firestore
  console.log('🔍 Step 1: Checking for existing admin accounts in Firestore...');
  try {
    const usersRef = collection(db, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'));
    const adminSnap = await getDocs(adminQuery);

    if (!adminSnap.empty) {
      const existingAdmin = adminSnap.docs[0].data();
      console.log('');
      console.log('⚠️  An administrator account already exists:');
      console.log(`   Email:     ${existingAdmin.email}`);
      console.log(`   Member ID: ${existingAdmin.memberId}`);
      console.log(`   Name:      ${existingAdmin.fullName}`);
      console.log('');
      console.log('🛑 Bootstrap aborted. Only one admin bootstrap is allowed.');
      process.exit(0);
    }

    console.log('   ✅ No existing admin found. Proceeding with creation...');
  } catch (err) {
    console.error('❌ Failed to query Firestore:', err.message);
    process.exit(1);
  }

  // Step 2: Create Firebase Auth account
  console.log('');
  console.log('🔐 Step 2: Creating Firebase Auth account...');
  let user;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      authInstance,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );
    user = userCredential.user;
    console.log(`   ✅ Auth account created. UID: ${user.uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('   ⚠️  Auth account already exists. Attempting sign-in to retrieve UID...');
      try {
        const signInResult = await signInWithEmailAndPassword(
          authInstance,
          ADMIN_EMAIL,
          ADMIN_PASSWORD
        );
        user = signInResult.user;
        console.log(`   ✅ Signed in. UID: ${user.uid}`);
      } catch (signInErr) {
        console.error('❌ Failed to sign in with existing admin account:', signInErr.message);
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to create Auth account:', err.message);
      process.exit(1);
    }
  }

  // Step 3: Create Firestore user document
  console.log('');
  console.log('📄 Step 3: Creating Firestore user document...');
  try {
    const adminDocData = {
      uid: user.uid,
      memberId: ADMIN_MEMBER_ID,
      fullName: ADMIN_FULL_NAME,
      email: ADMIN_EMAIL,
      phone: '',
      address: 'Smart Circular Village HQ',
      role: 'admin',
      status: 'active',
      points: 0,
      rfidUid: null,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', user.uid), adminDocData);
    console.log(`   ✅ Firestore document created at: users/${user.uid}`);
  } catch (err) {
    console.error('❌ Failed to create Firestore document:', err.message);
    process.exit(1);
  }

  // Done
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ Admin bootstrap complete!');
  console.log('');
  console.log('   Login Credentials (DEVELOPMENT ONLY):');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('');
  console.log('⚠️  SECURITY REMINDERS:');
  console.log('   1. Change the admin password after first login.');
  console.log('   2. Do NOT commit this script with real credentials.');
  console.log('   3. In production, use Firebase Admin SDK + service account.');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  process.exit(0);
}

bootstrap();
