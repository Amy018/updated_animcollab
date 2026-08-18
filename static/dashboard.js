// ===== ANIMATIONS DATA =====
const animations = [
  { title: "Neon Drift", duration: "00:12", updated: "2d ago" },
  { title: "Midnight Loop", duration: "00:08", updated: "5d ago" },
  { title: "Solar Flare", duration: "00:20", updated: "1w ago" }
];

// ===== ELEMENTS =====
const gallery = document.getElementById("animationGallery");
const modal = document.getElementById("previewModal");
const modalTitle = document.getElementById("modalTitle");
const modalInfo = document.getElementById("modalInfo");
const closeBtn = document.querySelector(".modal .close");

// ===== RENDER ANIMATIONS =====
function renderAnimations() {
  if (!gallery) return;

  gallery.innerHTML = "";

  animations.forEach((animation, index) => {
    const card = document.createElement("div");
    card.className = "animation-card";

    card.innerHTML = `
      <div class="card-overlay">
        <div class="play-icon">▶</div>
        <div class="card-info">
          <h4>${animation.title}</h4>
          <p>${animation.duration} • Edited ${animation.updated}</p>
        </div>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    // Open modal
    card.addEventListener("click", () => {
      openModal(animation);
    });

    // Delete button
    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteAnimation(index);
    });

    gallery.appendChild(card);
  });

  // Create new card
  const newCard = document.createElement("div");
  newCard.className = "animation-card empty";
  newCard.innerHTML = `
    <span>+</span>
    <p>Create New Animation</p>
  `;

  newCard.addEventListener("click", addNewAnimation);
  gallery.appendChild(newCard);
}

// ===== ADD NEW ANIMATION =====
function addNewAnimation() {
  const title = prompt("Enter animation title:");
  if (!title) return;

  const duration = prompt("Enter duration (e.g., 00:12):", "00:10") || "00:10";

  animations.push({
    title,
    duration,
    updated: "just now"
  });

  renderAnimations();
}

// ===== DELETE ANIMATION =====
function deleteAnimation(index) {
  const confirmDelete = confirm(
    `Delete "${animations[index].title}"?`
  );
  if (!confirmDelete) return;

  animations.splice(index, 1);
  renderAnimations();
}

// ===== MODAL =====
function openModal(animation) {
  if (!modal) return;

  modal.style.display = "block";
  modalTitle.textContent = animation.title;
  modalInfo.textContent = `${animation.duration} • Edited ${animation.updated}`;
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// ===== MAIN INIT =====
document.addEventListener("DOMContentLoaded", () => {

  // ===== PROFILE ELEMENTS =====
  const avatarImg = document.getElementById("avatarImg");
  const avatarInput = document.getElementById("avatarInput");
  const changeAvatarBtn = document.querySelector(".btn-avatar");

  const editProfileBtn = document.getElementById("editProfileBtn");
  const usernameEl = document.getElementById("username");
  const userBioEl = document.getElementById("userBio");

  // ===== AVATAR CHANGE =====
  if (changeAvatarBtn && avatarInput) {
    changeAvatarBtn.addEventListener("click", () => {
      avatarInput.click();
    });
  }

  if (avatarInput && avatarImg) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        avatarImg.src = event.target.result;
        localStorage.setItem("profileAvatar", event.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // ===== EDIT PROFILE =====
  if (editProfileBtn && usernameEl && userBioEl) {
    editProfileBtn.addEventListener("click", () => {
      const newName = prompt("Enter your name:", usernameEl.textContent);
      if (newName && newName.trim()) {
        usernameEl.textContent = newName;
        localStorage.setItem("profileName", newName);
      }

      const newBio = prompt("Enter your bio:", userBioEl.textContent);
      if (newBio && newBio.trim()) {
        userBioEl.textContent = newBio;
        localStorage.setItem("profileBio", newBio);
      }
    });
  }

  // ===== LOAD SAVED PROFILE =====
  if (avatarImg && localStorage.getItem("profileAvatar")) {
    avatarImg.src = localStorage.getItem("profileAvatar");
  }

  if (usernameEl && localStorage.getItem("profileName")) {
    usernameEl.textContent = localStorage.getItem("profileName");
  }

  if (userBioEl && localStorage.getItem("profileBio")) {
    userBioEl.textContent = localStorage.getItem("profileBio");
  }

  // ===== PRIVATE GALLERY =====
  const toggleBtn = document.getElementById("togglePrivateGallery");
  const privateGallery = document.getElementById("privateGalleryContainer");
  const createPrivateBtn = document.getElementById("createPrivateAnimation");

  let privateAnimations =
    JSON.parse(localStorage.getItem("privateAnimations")) || [];

  function renderPrivateGallery() {
    if (!privateGallery) return;

    privateGallery.innerHTML = "";

    if (privateAnimations.length === 0) {
      privateGallery.innerHTML = "<p>No private animations yet.</p>";
      return;
    }

    privateAnimations.forEach((anim, index) => {
      const card = document.createElement("div");
      card.className = "animation-card";
      card.textContent = anim.title;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "×";

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${anim.title}"?`)) {
          privateAnimations.splice(index, 1);
          localStorage.setItem(
            "privateAnimations",
            JSON.stringify(privateAnimations)
          );
          renderPrivateGallery();
        }
      });

      card.appendChild(deleteBtn);

      card.addEventListener("click", () => {
        alert(`Viewing: "${anim.title}"`);
      });

      privateGallery.appendChild(card);
    });
  }

  // Toggle private gallery
  if (toggleBtn && privateGallery) {
    toggleBtn.addEventListener("click", () => {
      const savedPassword = localStorage.getItem("privateGalleryPassword");

      if (privateGallery.classList.contains("hidden")) {
        if (!savedPassword) {
          const newPassword = prompt("Set password:");
          if (newPassword) {
            localStorage.setItem("privateGalleryPassword", newPassword);
            privateGallery.classList.remove("hidden");
          }
        } else {
          const password = prompt("Enter password:");
          if (password === savedPassword) {
            privateGallery.classList.remove("hidden");
          } else {
            alert("Incorrect password");
          }
        }
      } else {
        privateGallery.classList.add("hidden");
      }
    });
  }

  // Add private animation
  if (createPrivateBtn) {
    createPrivateBtn.addEventListener("click", () => {
      const title = prompt("Enter animation title:");
      if (!title) return;

      privateAnimations.push({ title });
      localStorage.setItem(
        "privateAnimations",
        JSON.stringify(privateAnimations)
      );

      renderPrivateGallery();
    });
  }

  // ===== INITIAL RENDER =====
  renderAnimations();
  renderPrivateGallery();
});
