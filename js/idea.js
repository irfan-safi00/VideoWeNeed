 // js/idea.js
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { getApp } from "firebase/app";

const app = getApp();
const db = getFirestore(app);

// DOM Elements
const ideaForm = document.getElementById("ideaForm");
const regionSelect = document.getElementById("region");

// --- Region persistence ---
let region = localStorage.getItem("region") || "global";
regionSelect.value = region;

regionSelect.addEventListener("change", () => {
  region = regionSelect.value;
  localStorage.setItem("region", region);
});

// --- Multi-language banned words ---
const bannedWords = [
  // English
  "nsfw","porn","sex","drugs","violence","suicide","kill","abuse",
  // Spanish
  "sexo","pornografía","violencia","droga","matar","suicidio",
  // French
  "sexe","pornographie","violence","drogue","tuer","suicide",
  // German
  "sex","pornographie","gewalt","droge","töten","selbstmord",
  // Hindi
  "सेक्स","पोर्न","हिंसा","नशा","हत्या","आत्महत्या",
  // Bengali
  "সেক্স","পর্ন","হিংসা","মাদক","হত্যা","আত্মহত্যা"
];

// --- Helper: Check banned words ---
function containsBannedWords(text) {
  const lower = text.toLowerCase();
  return bannedWords.some(word => lower.includes(word));
}

// --- Submit Handler ---
ideaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value.trim();
  const creator = document.getElementById("creator").value.trim() || "Any";

  // --- Validate banned words ---
  if (containsBannedWords(title) || containsBannedWords(description) || containsBannedWords(category) || containsBannedWords(creator)) {
    alert("Your submission contains banned or sensitive words. Please remove them.");
    return;
  }

  try {
    // --- Check site freeze ---
    const settingsDoc = doc(db, "settings", "site");
    const settingsSnap = await getDoc(settingsDoc);

    if (!settingsSnap.exists()) {
      alert("Site settings not found. Please try later.");
      return;
    }

    const siteData = settingsSnap.data();
    if (siteData.freeze) {
      alert(siteData.maintenanceMessage || "Posting is temporarily disabled.");
      return;
    }

    // --- Check for duplicate title ---
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("title", "==", title));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert("An idea with this title already exists. Please try a different title.");
      return;
    }

    // --- Submit idea to Firestore ---
    await addDoc(postsRef, {
      title,
      description,
      category,
      creator,
      region,
      votes: 0,
      reports: 0,
      status: "active",
      createdAt: serverTimestamp()
    });

    alert("Idea submitted successfully!");
    ideaForm.reset();

  } catch (err) {
    console.error(err);
    alert("Error submitting idea. Please try again later.");
  }
});
