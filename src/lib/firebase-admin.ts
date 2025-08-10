import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';

let app: App;
let db: admin.firestore.Firestore;

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    db = admin.firestore(app);
    return;
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountEnv) {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK features will be disabled.');
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    db = admin.firestore(app);
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
}

initializeFirebaseAdmin();

export { db };
