// js/feed.js
import { getFirestore, collection, query, orderBy, limit, startAfter, getDocs, onSnapshot } from "firebase/firestore";
import { getApp } from "firebase/app";

const app = getApp();
const db = getFirestore(app);

const feedContainer = document.getElementById("feed");
const regionSelect = document.getElementById("region");

let region = localStorage.getItem("region") || "global";
regionSelect.value = region;

let lastVisible = null;
let loading = false;
const batchSize = 10;

// --- Save region on change ---
regionSelect.addEventListener("change", () => {
  region = regionSelect.value;
  localStorage.setItem("region", region);
  feedContainer.innerHTML = ""; // clear feed
  lastVisible = null;
  loadPosts();
});

// --- Load Posts Batch ---
async function loadPosts() {
  if (loading) return;
  loading = true;

  const postsRef = collection(db, "posts");
  let q = query(postsRef, orderBy("createdAt", "desc"));

  // Filter by region
  q = query(postsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  // Clear feed if first load
  if (!lastVisible) feedContainer.innerHTML = "";

  let postsLoaded = 0;

  snapshot.forEach(doc => {
    const data = doc.data();

    // Skip if not the selected region or hidden
    if (data.region !== region || data.status !== "active") return;

    // Create card
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="category">${data.category}</span>
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <small>Suggested Creator: ${data.creator || "Any"}</small>
      <div class="post-actions">
        <button class="vote-btn">👍 ${data.votes || 0}</button>
        <button class="report-btn">⚠️ Report</button>
      </div>
    `;

    // Vote button
    card.querySelector(".vote-btn").addEventListener("click", async () => {
      const docRef = doc(db, "posts", doc.id);
      await updateDoc(docRef, { votes: (data.votes || 0) + 1 });
      card.querySelector(".vote-btn").innerText = `👍 ${data.votes + 1}`;
    });

    // Report button
    card.querySelector(".report-btn").addEventListener("click", async () => {
      const docRef = doc(db, "posts", doc.id);
      await updateDoc(docRef, { reports: (data.reports || 0) + 1 });
      alert("Post reported!");
    });

    feedContainer.appendChild(card);
    postsLoaded++;
  });

  // Show empty state if no posts
  if (postsLoaded === 0) {
    feedContainer.innerHTML = `
      <div class="no-posts">
        <h3>No ideas in this region!</h3>
        <p>Be the first to submit an idea 💡</p>
        <a href="idea.html" class="submit-link">Submit Idea</a>
      </div>
    `;
  }

  loading = false;
}

// --- Infinite scroll ---
window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
    loadPosts();
  }
});

// --- Initial load ---
loadPosts();
