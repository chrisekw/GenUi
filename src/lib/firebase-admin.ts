import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    // Use the FIREBASE_CONFIG environment variable to automatically
    // configure the Admin SDK.
    ...(process.env.FIREBASE_CONFIG &&
      JSON.parse(process.env.FIREBASE_CONFIG)),
    projectId: 'genui-ai-component-generator',
  });
}

const db = admin.firestore();

export { db };
