// js/admin.js
import { getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginContainer = document.getElementById("login-container");
const adminDashboard = document.getElementById("admin-dashboard");
const loginBtn = document.getElementById("login-btn");
const adminEmail = document.getElementById("admin-email");
const adminPassword = document.getElementById("admin-password");

const adminFeed = document.getElementById("admin-feed");
const toggleFreezeBtn = document.getElementById("toggle-freeze");
const freezeStatus = document.getElementById("freeze-status");

// --- Login ---
loginBtn.addEventListener("click", async () => {
  const email = adminEmail.value.trim();
  const password = adminPassword.value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Check if UID is in admins collection
    const adminDoc = await getDoc(doc(db, "admins", uid));
    if (!adminDoc.exists()) {
      alert("You are not authorized as admin.");
      return;
    }

    // Hide login, show dashboard
    loginContainer.style.display = "none";
    adminDashboard.style.display = "block";

    // Load admin data
    loadFreezeStatus();
    loadAllPosts();

  } catch (err) {
    console.error(err);
    alert("Login failed. Check email/password.");
  }
});

// --- Load Freeze Status ---
async function loadFreezeStatus() {
  const siteDoc = doc(db, "settings", "site");
  const snap = await getDoc(siteDoc);
  if (!snap.exists()) return;
  const data = snap.data();
  freezeStatus.innerText = data.freeze ? "Site is FROZEN" : "Site is ACTIVE";
}

// --- Toggle Site Freeze ---
toggleFreezeBtn.addEventListener("click", async () => {
  const siteDoc = doc(db, "settings", "site");
  const snap = await getDoc(siteDoc);
  if (!snap.exists()) return;

  const current = snap.data().freeze || false;
  await updateDoc(siteDoc, { freeze: !current });
  freezeStatus.innerText = !current ? "Site is FROZEN" : "Site is ACTIVE";
  alert("Site freeze toggled!");
});

// --- Load All Posts ---
async function loadAllPosts() {
  adminFeed.innerHTML = "Loading posts...";

  const postsRef = collection(db, "posts");
  const snapshot = await getDocs(postsRef);

  adminFeed.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="category">${data.category}</span>
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <small>Region: ${data.region} | Creator: ${data.creator || "Any"}</small>
      <div class="post-actions">
        <button class="hide-btn">${data.status === "hidden" ? "Unhide" : "Hide"}</button>
        <button class="delete-btn">Delete</button>
      </div>
      <p>Votes: ${data.votes || 0} | Reports: ${data.reports || 0}</p>
    `;

    // Hide / Unhide post
    card.querySelector(".hide-btn").addEventListener("click", async () => {
      const postRef = doc(db, "posts", docSnap.id);
      await updateDoc(postRef, { status: data.status === "hidden" ? "active" : "hidden" });
      alert("Post status updated!");
      loadAllPosts();
    });

    // Delete post
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete this post?")) return;
      const postRef = doc(db, "posts", docSnap.id);
      await deleteDoc(postRef);
      alert("Post deleted!");
      loadAllPosts();
    });

    adminFeed.appendChild(card);
  });

  if (snapshot.empty) {
    adminFeed.innerHTML = "<p>No posts yet.</p>";
  }
}
