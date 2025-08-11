'use server';

import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;

function initializeAdmin() {
  if (!admin.apps.length) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountStr) {
      throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
    }

    try {
      // Decode Base64-encoded service account
      const decoded = Buffer.from(serviceAccountStr, 'base64').toString('utf8');
      const serviceAccount = JSON.parse(decoded);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw new Error('Firebase Admin initialization failed.');
    }
  }
}

export async function getDb(): Promise<admin.firestore.Firestore> {
  if (!adminDb) {
    initializeAdmin();
    adminDb = admin.firestore();
  }
  return adminDb;
}
