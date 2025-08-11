
import * as admin from 'firebase-admin';

function initializeAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin SDK initialized successfully.');
        return app;
    } catch (error: any) {
        console.error('Error initializing Firebase Admin SDK:', error.message);
        // Prevent the app from crashing if initialization fails.
        // The error will be caught and handled in the functions that use getDb().
        return null;
    }
}

export function getDb() {
    const app = initializeAdmin();
    if (!app) {
        return null;
    }
    return admin.firestore();
}
