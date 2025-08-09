import * as admin from 'firebase-admin';

// Correctly handle service account parsing from environment variable
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount: admin.ServiceAccount | undefined;

if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch(e) {
    console.error("Error parsing Firebase service account", e);
    // Set to undefined to prevent initialization with a bad object
    serviceAccount = undefined; 
  }
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "genui-ai-component-generator",
    });
  } else {
    // Initialize without credentials, relying on Application Default Credentials
    admin.initializeApp();
  }
}

const db = admin.firestore();

export { db };
