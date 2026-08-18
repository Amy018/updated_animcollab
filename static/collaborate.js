
let collaborators = JSON.parse(localStorage.getItem("collaborators")) || [];


const addBtn = document.getElementById("addCollabBtn");
const collabInput = document.getElementById("collabInput");
const collabList = document.getElementById("collabList");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

const startBtn = document.getElementById("startCollabBtn");

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


function saveAndRender() {
    localStorage.setItem("collaborators", JSON.stringify(collaborators));
    renderCollaborators();
}


addBtn.addEventListener("click", function () {

    let name = collabInput.value.trim();

    if (name === "") {
        alert("Enter collaborator name");
        return;
    }

  
    if (collaborators.includes(name)) {
        alert("Collaborator already added!");
        return;
    }

    collaborators.push(name);
    collabInput.value = "";

    saveAndRender();
});


startBtn.addEventListener("click", function () {

    if (collaborators.length === 0) {
        alert("Add at least one collaborator first!");
        return;
    }

    localStorage.setItem("collaborators", JSON.stringify(collaborators));

   
    window.location.href = "/create";
});

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


renderCollaborators();
