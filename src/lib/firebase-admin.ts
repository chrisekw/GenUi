import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'genui-ai-component-generator',
  });
}

const db = admin.firestore();

export { db };
