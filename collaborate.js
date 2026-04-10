// ===== STORAGE =====
let collaborators = JSON.parse(localStorage.getItem("collaborators")) || [];

// ===== ELEMENTS =====
const addBtn = document.getElementById("addCollabBtn");
const collabInput = document.getElementById("collabInput");
const collabList = document.getElementById("collabList");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

const startBtn = document.getElementById("startCollabBtn");

// ===== RENDER FUNCTION =====
function renderCollaborators() {
    collabList.innerHTML = "";

    collaborators.forEach((name, index) => {
        let li = document.createElement("li");
        li.textContent = name;

        let removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "removeBtn";

        removeBtn.onclick = function () {
            collaborators.splice(index, 1);
            saveAndRender();
        };

        li.appendChild(removeBtn);
        collabList.appendChild(li);
    });
}

// ===== SAVE + RERENDER =====
function saveAndRender() {
    localStorage.setItem("collaborators", JSON.stringify(collaborators));
    renderCollaborators();
}

// ===== ADD COLLABORATOR =====
addBtn.addEventListener("click", function () {

    let name = collabInput.value.trim();

    if (name === "") {
        alert("Enter collaborator name");
        return;
    }

    // جلوگیری از تکرار (no duplicates)
    if (collaborators.includes(name)) {
        alert("Collaborator already added!");
        return;
    }

    collaborators.push(name);
    collabInput.value = "";

    saveAndRender();
});

// ===== START COLLABORATION =====
startBtn.addEventListener("click", function () {

    if (collaborators.length === 0) {
        alert("Add at least one collaborator first!");
        return;
    }

    localStorage.setItem("collaborators", JSON.stringify(collaborators));

    // FIXED: Use Flask route for Create page
    window.location.href = "/create";
});

// ===== CHAT SYSTEM =====
sendBtn.addEventListener("click", function () {

    let message = messageInput.value.trim();

    if (message === "") {
        alert("Type a message");
        return;
    }

    let msg = document.createElement("div");
    msg.className = "message";
    msg.textContent = "User: " + message;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    messageInput.value = "";
});

// ===== INITIAL LOAD =====
renderCollaborators();