
'use server';

import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountStr) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountStr);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    // Throw the error to be caught by the calling function
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

export async function getDb(): Promise<admin.firestore.Firestore> {
  if (!admin.apps.length) {
    initializeAdmin();
  }
  
  if (!adminDb) {
    adminDb = admin.firestore();
  }

  if (!adminDb) {
    // This should ideally not be reached if initialization is successful
    throw new Error('Database not available after initialization attempt.');
  }
  
  return adminDb;
}
