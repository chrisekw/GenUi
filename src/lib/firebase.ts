import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDCuz7WZSSi_IWGCpHyjPBtgJzQgiNN1c",
  authDomain: "prospectiq-goupw.firebaseapp.com",
  projectId: "prospectiq-goupw",
  storageBucket: "prospectiq-goupw.firebasestorage.app",
  messagingSenderId: "857375222885",
  appId: "1:857375222885:web:6202879e391b4bf1a06a8c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
