const admin = require('firebase-admin');

// Initialize Firebase Admin App singleton
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const rtdb = admin.database();

module.exports = {
  admin,
  db,
  rtdb,
};
