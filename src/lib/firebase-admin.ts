
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function getDb(): admin.firestore.Firestore {
  if (db) {
    return db;
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }

    const serviceAccount = JSON.parse(serviceAccountString);

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    }

    db = admin.firestore();
    return db;
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    // Throw an error that is more descriptive and will crash the action,
    // preventing further execution with an uninitialized db.
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

export { getDb };
