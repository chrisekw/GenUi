import * as admin from 'firebase-admin';

// Correctly handle service account parsing from environment variable
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
let serviceAccount: admin.ServiceAccount | undefined;
if (serviceAccountString) {
  try {
    serviceAccount = JSON.parse(serviceAccountString);
  } catch(e) {
    console.error("Error parsing Firebase service account", e);
  }
}

if (!admin.apps.length) {
  admin.initializeApp(serviceAccount ? {
    credential: admin.credential.cert(serviceAccount),
    projectId: "genui-ai-component-generator",
  } : undefined);
}

const db = admin.firestore();

export { db };
