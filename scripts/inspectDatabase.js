/**
 * Smart Circular Village (SCV) — Database Inspector Script
 *
 * Reads & prints live records from Cloud Firestore & Firebase Realtime Database.
 *
 * Usage:
 *   node scripts/inspectDatabase.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  get,
} from 'firebase/database';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env
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

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

async function inspect() {
  console.log('\n==================================================');
  console.log('  🔍 SCV LIVE DATABASE INSPECTION REPORT');
  console.log('==================================================');
  console.log(`📌 Project ID: ${firebaseConfig.projectId}\n`);

  // 1. Firestore Collections Inspection
  const collectionsToInspect = [
    'users',
    'devices',
    'transactions',
    'rewards',
    'reward_redemptions',
    'settings',
    'notifications',
  ];

  console.log('--- 1. CLOUD FIRESTORE COLLECTIONS ---');

  for (const colName of collectionsToInspect) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`\n📁 Collection [${colName}]: ${snap.size} document(s)`);
      if (!snap.empty) {
        snap.docs.forEach((docSnap, i) => {
          console.log(`   [${i + 1}] ID: ${docSnap.id}`);
          console.log(`       Data: ${JSON.stringify(docSnap.data(), null, 2).replace(/\n/g, '\n       ')}`);
        });
      } else {
        console.log('   (Kosong / belum ada dokumen)');
      }
    } catch (err) {
      console.log(`   ⚠️ Error reading [${colName}]: ${err.message}`);
    }
  }

  // 2. Realtime Database Inspection
  console.log('\n\n--- 2. FIREBASE REALTIME DATABASE (RTDB) ---');
  const rtdbNodes = ['devices', 'pending_transactions'];

  for (const nodeName of rtdbNodes) {
    try {
      const snap = await get(ref(rtdb, nodeName));
      console.log(`\n⚡ RTDB Node [/${nodeName}]:`);
      if (snap.exists()) {
        console.log(JSON.stringify(snap.val(), null, 2));
      } else {
        console.log('   (Kosong / Node belum dibuat)');
      }
    } catch (err) {
      console.log(`   ⚠️ Error reading RTDB node [/${nodeName}]: ${err.message}`);
    }
  }

  console.log('\n==================================================');
  console.log('  ✅ Inspection Complete');
  console.log('==================================================\n');
  process.exit(0);
}

inspect();
