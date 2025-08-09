import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountEnv) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable not set.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountEnv);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'genui-ai-component-generator',
    });
  } catch (error: any) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT or initializing Firebase Admin SDK:', error.message);
    throw new Error('Failed to initialize Firebase Admin SDK.');
  }
}

try {
  const app = initializeFirebaseAdmin();
  db = admin.firestore(app);
} catch (error) {
  console.error(error);
  // db remains undefined, actions using it will fail gracefully
}

export { db };
