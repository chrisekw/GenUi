import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1fA7a9zJ8sR6t3bF2eG5hJ7kL0dC9nI",
  authDomain: "genui-ai-component-generator.firebaseapp.com",
  projectId: "genui-ai-component-generator",
  storageBucket: "genui-ai-component-generator.appspot.com",
  messagingSenderId: "43837238710",
  appId: "1:43837238710:web:77c8d54f669d695abee517"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
