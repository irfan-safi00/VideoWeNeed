// admin.js

const regionSelect = document.getElementById("regionSelect");
const adminContainer = document.getElementById("admin");

// Load flagged and reported posts for selected region
function loadAdminPosts() {
  const regionVal = regionSelect.value;
  const ideaCollection = db.collection("ideas").doc(regionVal).collection("posts")
    .orderBy("timestamp","desc");

  ideaCollection.onSnapshot(snapshot => {
    adminContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();

      // Only show flagged or reported posts
      if (!d.flagged && !d.reported) return;

      adminContainer.innerHTML += `
        <div class="idea">
          <span class="idea-category">${d.category}</span>
          <h3>${d.title}</h3>
          <p>${d.desc}</p>
          <small>Suggested for: ${d.creator || "Any"} | Votes: ${d.votes}</small><br>
          <small>Flagged: ${d.flagged} | Reported: ${d.reported}</small><br>
          <button class="approve" onclick="approve('${regionVal}','${doc.id}')">✅ Approve</button>
          <button class="delete" onclick="remove('${regionVal}','${doc.id}')">🗑️ Delete</button>
        </div>
      `;
    });
  });
}

// Approve a post (unhide flagged posts)
function approve(region, id) {
  const ref = db.collection("ideas").doc(region).collection("posts").doc(id);
  ref.update({ hidden: false, flagged: false, reported: false });
}

// Delete a post permanently
function remove(region, id) {
  if (confirm("Are you sure you want to delete this post?")) {
    const ref = db.collection("ideas").doc(region).collection("posts").doc(id);
    ref.delete();
  }
}

// Event listener for region selection
regionSelect.addEventListener("change", loadAdminPosts);

// Initial load
loadAdminPosts();
