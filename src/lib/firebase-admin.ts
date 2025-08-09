import * as admin from 'firebase-admin';

// This is the recommended way to initialize the admin SDK on the server-side,
// especially in serverless environments. It expects the service account JSON
// to be provided in an environment variable.

if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountEnv) {
    try {
      // The environment variable must be a valid JSON string.
      const serviceAccount = JSON.parse(serviceAccountEnv);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'genui-ai-component-generator',
      });
    } catch (error: any) {
      console.error(
        'Error parsing FIREBASE_SERVICE_ACCOUNT. Make sure it is a valid JSON string.',
        error.message
      );
      // We don't initialize here to avoid the cryptic "INTERNAL" error.
      // The app will fail, but with a clearer error message.
    }
  } else {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT environment variable not set. Firebase Admin SDK not initialized.'
    );
  }
}

const db = admin.apps.length ? admin.firestore() : undefined;

export { db };
