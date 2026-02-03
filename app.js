// app.js

// Banned words per region
const bannedWords = {
  global: ["porn","sex","kill","suicide","terror","bomb","murder"],
  india: ["sex","murder","suicide","bomba"],
  bangladesh: ["sex","murder","suicide","bomba"]
};

// Get HTML elements
const titleInput = document.getElementById("title");
const descInput = document.getElementById("desc");
const creatorInput = document.getElementById("creator");
const categorySelect = document.getElementById("category");
const regionSelect = document.getElementById("region");
const ideasContainer = document.getElementById("ideas");

// Simple SHA-256 hash function for duplicate detection
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Submit a new idea
async function submitIdea() {
  const regionVal = regionSelect.value;
  const titleVal = titleInput.value.trim();
  const descVal = descInput.value.trim();
  const creatorVal = creatorInput.value.trim();
  const categoryVal = categorySelect.value;

  if (!titleVal || !descVal || !categoryVal) {
    alert("Please fill title, description, and select a category.");
    return;
  }

  const uniqueHash = await sha256(titleVal + descVal);

  // Check banned words
  const flagged = bannedWords[regionVal].some(word =>
    (titleVal + " " + descVal).toLowerCase().includes(word)
  );

  const ideaCollection = db.collection("ideas").doc(regionVal).collection("posts");

  // Check for duplicates
  const duplicateCheck = await ideaCollection.where("uniqueHash","==",uniqueHash).get();
  if (!duplicateCheck.empty) {
    alert("This idea has already been submitted!");
    return;
  }

  // Add the idea
  ideaCollection.add({
    title: titleVal,
    desc: descVal,
    creator: creatorVal,
    category: categoryVal,
    votes: 0,
    flagged: flagged,
    hidden: flagged, // automatically hide if banned word detected.
    reported: false,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    uniqueHash: uniqueHash
  });

  // Clear form
  titleInput.value = "";
  descInput.value = "";
  creatorInput.value = "";
  categorySelect.value = "";
}

// Load ideas for selected region
function loadIdeas() {
  const regionVal = regionSelect.value;
  const ideaCollection = db.collection("ideas").doc(regionVal).collection("posts").orderBy("votes","desc");

  ideaCollection.onSnapshot(snapshot => {
    ideasContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const d = doc.data();
      if(d.hidden) return; // skip hidden posts

      ideasContainer.innerHTML += `
        <div class="idea">
          <span class="idea-category">${d.category}</span>
          <h3>${d.title}</h3>
          <p>${d.desc}</p>
          <small>Suggested for: ${d.creator || "Any"}</small><br>
          <button class="vote" onclick="vote('${regionVal}','${doc.id}')">👍 ${d.votes}</button>
          <button class="report" onclick="report('${regionVal}','${doc.id}')">🚩 Report</button>
        </div>
      `;
    });
  });
}

// Vote function (increments votes)
function vote(region,id) {
  const ref = db.collection("ideas").doc(region).collection("posts").doc(id);
  ref.update({ votes: firebase.firestore.FieldValue.increment(1) });
}

// Report function (marks post as reported)
function report(region,id) {
  const ref = db.collection("ideas").doc(region).collection("posts").doc(id);
  ref.update({ reported: true });
  alert("This post has been reported!");
}

// Event listener for region change
regionSelect.addEventListener("change", loadIdeas);

// Initial load
loadIdeas();
