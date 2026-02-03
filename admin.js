// js/admin.js

const regionSelect = document.getElementById("region");
const adminFeed = document.getElementById("admin-feed");

const freezeStatusEl = document.getElementById("freeze-status");
const freezeBtn = document.getElementById("freeze-btn");
const unfreezeBtn = document.getElementById("unfreeze-btn");

const settingsRef = db.collection("settings").doc("site");

// --- Load site freeze status ---
settingsRef.onSnapshot(doc => {
  if (!doc.exists) return;
  const data = doc.data();
  freezeStatusEl.innerText = data.freezeActive ? "Frozen" : "Active";
});

// Freeze / Unfreeze buttons
freezeBtn.addEventListener("click", () => {
  settingsRef.set({ freezeActive: true });
  alert("Site frozen");
});
unfreezeBtn.addEventListener("click", () => {
  settingsRef.set({ freezeActive: false });
  alert("Site active");
});

// --- Load flagged/reported posts ---
async function loadPosts(region) {
  adminFeed.innerHTML = "<p style='text-align:center;'>Loading...</p>";
  const postsRef = db.collection("ideas").doc(region).collection("posts")
    .orderBy("timestamp","desc");

  postsRef.onSnapshot(snapshot => {
    adminFeed.innerHTML = "";
    if(snapshot.empty){
      adminFeed.innerHTML = "<p style='text-align:center;'>No flagged or reported posts</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      if(!data.flagged && !data.reported) return; // only show flagged/reported

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <span class="category">${data.category}</span>
        <h3>${data.title}</h3>
        <p>${data.desc}</p>
        <small>Suggested Creator: ${data.creator || "Any"}</small>
        <div style="margin-top:8px;">
          <button class="approve-btn">Approve</button>
          <button class="delete-btn">Delete</button>
        </div>
      `;

      // Approve
      card.querySelector(".approve-btn").addEventListener("click", () => {
        doc.ref.update({ flagged: false, reported: false, hidden: false });
      });

      // Delete
      card.querySelector(".delete-btn").addEventListener("click", () => {
        doc.ref.delete();
      });

      adminFeed.appendChild(card);
    });
  });
}

// Load posts on region change
regionSelect.addEventListener("change", () => {
  loadPosts(regionSelect.value);
});

// Initial load
loadPosts(regionSelect.value);
