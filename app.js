// js/app.js

const feedContainer = document.getElementById("feed");
const regionSelect = document.getElementById("region");

let region = regionSelect.value;
let lastVisible = null;
let loading = false;
const batchSize = 10;

// Load posts batch
async function loadPosts() {
  if (loading) return;
  loading = true;

  const postsRef = db.collection("ideas").doc(region).collection("posts")
    .orderBy("timestamp", "desc");

  let query = postsRef.limit(batchSize);

  if (lastVisible) {
    query = query.startAfter(lastVisible);
  }

  const snapshot = await query.get();

  if (snapshot.empty && !lastVisible) {
    feedContainer.innerHTML = `
      <div class="no-posts">
        <h3>No ideas yet!</h3>
        <p>Be the first to submit an idea 💡</p>
        <a href="idea.html" class="submit-link">Write an Idea</a>
      </div>
    `;
    loading = false;
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    if(data.hidden) return; // skip hidden posts

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <span class="category">${data.category}</span>
      <h3>${data.title}</h3>
      <p>${data.desc}</p>
      <small>Suggested Creator: ${data.creator || "Any"}</small>
      <div style="margin-top:8px;">
        <button class="vote-btn">👍 ${data.votes || 0}</button>
        <button class="report-btn">⚠️ Report</button>
      </div>
    `;

    // Vote button
    card.querySelector(".vote-btn").addEventListener("click", async () => {
      await doc.ref.update({ votes: (data.votes || 0) + 1 });
    });

    // Report button
    card.querySelector(".report-btn").addEventListener("click", async () => {
      await doc.ref.update({ reported: true });
      alert("Post reported!");
    });

    feedContainer.appendChild(card);
  });

  if(snapshot.docs.length > 0){
    lastVisible = snapshot.docs[snapshot.docs.length -1];
  }

  loading = false;
}

// Infinite scroll
window.addEventListener("scroll", () => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
    loadPosts();
  }
});

// Region change
regionSelect.addEventListener("change", () => {
  region = regionSelect.value;
  lastVisible = null;
  feedContainer.innerHTML = ""; // clear feed
  loadPosts();
});

// Initial load
loadPosts();

// Real-time vote updates (optional)
db.collectionGroup("posts").onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if(change.type === "modified"){
      const data = change.doc.data();
      const cards = document.querySelectorAll(".card");
      cards.forEach(card => {
        const title = card.querySelector("h3").innerText;
        if(title === data.title){
          const voteBtn = card.querySelector(".vote-btn");
          voteBtn.innerText = `👍 ${data.votes || 0}`;
        }
      });
    }
  });
});
