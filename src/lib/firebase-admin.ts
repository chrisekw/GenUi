
import * as admin from 'firebase-admin';

// This is the service account JSON object from your Firebase project settings.
// It's recommended to store this in an environment variable.
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

let db: admin.firestore.Firestore | null = null;

function initializeAdmin() {
    if (admin.apps.length > 0) {
        // If the app is already initialized, just get the firestore instance.
        db = admin.firestore();
        return;
    }

    if (!serviceAccountString) {
        console.error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
        return;
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        db = admin.firestore();
        console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        // This will ensure getDb() returns null if initialization fails.
        db = null; 
    }
}

/**
 * Gets the initialized Firestore database instance.
 * It initializes the Firebase Admin SDK if it hasn't been already.
 * @returns The Firestore database instance, or null if initialization fails.
 */
export function getDb(): admin.firestore.Firestore | null {
    if (!db) {
        initializeAdmin();
    }
    return db;
}
