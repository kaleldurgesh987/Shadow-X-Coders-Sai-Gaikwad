// Firebase Admin SDK Initialization
// Built by Team ShadowX Coders

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
    console.warn(
      '[Firebase Admin] WARNING: Firebase Admin credentials not configured.\n' +
      'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env\n' +
      'Get these from Firebase Console → Project Settings → Service Accounts → Generate new private key'
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
    });
    console.log('[Firebase Admin] ✅ Initialized successfully');
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminStorage = admin.apps.length ? admin.storage() : null;

export default admin;
