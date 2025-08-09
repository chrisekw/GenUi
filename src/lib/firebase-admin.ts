import * as admin from 'firebase-admin';

// This is a more robust way to initialize the admin SDK on the server-side,
// especially in environments where Application Default Credentials (ADC) might
// not be configured. It checks for a service account JSON in an environment variable.

if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountEnv) {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'genui-ai-component-generator',
      });
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT or initializing Firebase Admin SDK:', error);
      // Fallback for environments where ADC might be available, but parsing failed.
      admin.initializeApp({
        projectId: 'genui-ai-component-generator',
      });
    }
  } else {
    // Initialize without credentials, relying on ADC if available.
    // This might be the case in some cloud environments.
    admin.initializeApp({
        projectId: 'genui-ai-component-generator',
    });
  }
}

const db = admin.firestore();

export { db };
