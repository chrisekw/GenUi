
import * as admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization failed:', error.message);
    // We are not throwing an error here to avoid crashing the server during build
    // The functions using db will handle the case where db is not available.
  }
}

adminDb = admin.firestore();

function getDb(): admin.firestore.Firestore {
    if (!adminDb) {
        console.error("Firestore is not initialized, returning placeholder.");
        // This is a fallback to prevent crashing, but errors should be caught earlier.
        // The actual functions should throw if the DB is not available.
    }
    return adminDb;
}


export { getDb };
