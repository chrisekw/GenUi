
import * as admin from 'firebase-admin';

// Check if the service account JSON is provided
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK will not be initialized in production.'
    );
  }
}

let adminDb: admin.firestore.Firestore;

try {
  // Check if there are any initialized apps
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT as string
    );
    // Initialize the app with a service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }
  adminDb = admin.firestore();
} catch (error: any) {
  console.error('Firebase Admin SDK initialization failed:', error.message);
  // We are not throwing an error here to avoid crashing the server during build
  // The functions using db will handle the case where db is not available.
}

function getDb(): admin.firestore.Firestore {
  if (!adminDb) {
    console.error('Firestore is not initialized, returning placeholder.');
    // This is a fallback to prevent crashing, but errors should be caught earlier.
    // The actual functions should throw if the DB is not available.
    throw new Error('Database not available.');
  }
  return adminDb;
}

export { getDb };
