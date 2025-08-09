import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;

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
      db = admin.firestore();
    } catch (error: any) {
      console.error(
        'Error parsing FIREBASE_SERVICE_ACCOUNT. Make sure it is a valid JSON string.',
        error.message
      );
      // db remains undefined
    }
  } else {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT environment variable not set. Firebase Admin SDK not initialized.'
    );
    // db remains undefined
  }
} else {
    db = admin.firestore();
}


export { db };
