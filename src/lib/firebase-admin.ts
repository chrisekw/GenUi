'use server';

import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;

function initializeAdmin(): void {
  if (!admin.apps.length) {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
          if (!serviceAccountStr) {
                throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
          }

          try {
              const decodedServiceAccount = Buffer.from(serviceAccountStr, 'base64').toString('utf-8');
              const serviceAccount = JSON.parse(decodedServiceAccount);

              // FIX: turn literal "\\n" into real line breaks
              serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

              admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
              });
          } catch (error: any) {
                console.error('Firebase Admin SDK initialization failed:', error.message);
                throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
          }
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
        throw new Error('Database not reached after initialization attempt.');
    }

    return adminDb;
}
