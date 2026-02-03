// js/firebase.js

// Firebase configuration
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

// Firestore reference
const db = firebase.firestore();

// Optional: enable anonymous auth for future features
firebase.auth().signInAnonymously()
  .then(() => {
    console.log("Signed in anonymously");
  })
  .catch((error) => {
    console.error("Anonymous sign-in error:", error);
  });
