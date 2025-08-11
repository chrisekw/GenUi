
'use server';

import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return;
  }
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set.'
    );
  }

  try {
    const decodedKey = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(decodedKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
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
