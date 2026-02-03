// firebase.js

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV3oHW4Y2c_fIrkiG41p0s4x5sISn8lIg",
  authDomain: "archive-site-2026.firebaseapp.com",
  projectId: "archive-site-2026",
  storageBucket: "archive-site-2026.firebasestorage.app",
  messagingSenderId: "185594379425",
  appId: "1:185594379425:web:c5a1cbb20ab3f3ee8c84e0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Auth & Firestore references
const auth = firebase.auth();
const db = firebase.firestore();

// Sign in users anonymously
auth.signInAnonymously()
  .then(() => console.log("Signed in anonymously"))
  .catch(err => console.error("Auth error:", err));
