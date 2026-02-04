// js/firebase.js
// Import only the modules you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Your Firebase configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBA0sZlv5IIY1xwiuOcuBC1RCJnnJM2krw",
  authDomain: "videoweneed.firebaseapp.com",
  projectId: "videoweneed",
  storageBucket: "videoweneed.appspot.com",
  messagingSenderId: "84649973722",
  appId: "1:84649973722:web:c2e4a703e7b37f616512e3"
};

// --- Initialize Firebase only once ---
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// --- Initialize Firebase services ---
const auth = getAuth(app);
const db = getFirestore(app);

// --- Export for other JS files ---
export { app, auth, db };
