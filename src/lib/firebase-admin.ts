
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountEnv) {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK features will be disabled.');
    return undefined;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    return app;
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    return undefined;
  }
}

export function getDb() {
  if (!db) {
    const app = initializeFirebaseAdmin();
    if (app) {
      db = admin.firestore(app);
    }
  }
  return db;
}
