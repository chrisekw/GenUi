import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Check if the service account environment variable is set
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountEnv) {
    console.error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK will not be initialized.');
    return null; // Return null to indicate initialization failure
  }

  try {
    // Parse the service account JSON from the environment variable
    const serviceAccount = JSON.parse(serviceAccountEnv);
    
    // Initialize the Firebase Admin SDK
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || 'genui-ai-component-generator',
    });
  } catch (error: any) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT or initializing Firebase Admin SDK:', error.message);
    return null; // Return null on error
  }
}

// Attempt to initialize Firebase Admin
const app = initializeFirebaseAdmin();

// Only initialize db if the app was successfully initialized
if (app) {
  db = admin.firestore(app);
}

export { db };
