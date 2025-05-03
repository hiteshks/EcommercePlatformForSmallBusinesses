import { auth, db } from "./firebase/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const guestButtons = document.getElementById("guest-buttons");
  const userMenu = document.getElementById("user-menu");

  if (user) {
    guestButtons.classList.add("hidden");
    userMenu.classList.remove("hidden");
  } else {
    guestButtons.classList.remove("hidden");
    userMenu.classList.add("hidden");
  }
});

// Dropdown toggle
document.getElementById("hamburger-btn").addEventListener("click", () => {
  const dropdown = document.getElementById("dropdown-menu");
  dropdown.classList.toggle("hidden");
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      location.reload(); // Reload to re-show login/signup
    })
    .catch((error) => {
      console.error("Logout Error:", error);
    });
});

//Close dropdown when clicked outside of it
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("dropdown-menu");
  const hamburger = document.getElementById("hamburger-btn");

  const isClickInside =
    dropdown.contains(event.target) || hamburger.contains(event.target);

  if (!isClickInside && !dropdown.classList.contains("hidden")) {
    dropdown.classList.add("hidden");
  }
});

//Main Carousel Code
const track = document.querySelector(".carousel-track");
const images = document.querySelectorAll(".carousel-image");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const indicatorsContainer = document.querySelector(".carousel-indicators");

let currentIndex = 0;
const totalImages = images.length;

// Create indicators
for (let i = 0; i < totalImages; i++) {
  const dot = document.createElement("div");
  if (i === 0) dot.classList.add("active");
  indicatorsContainer.appendChild(dot);
}
const indicators = indicatorsContainer.querySelectorAll("div");

function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  indicators.forEach((dot) => dot.classList.remove("active"));
  indicators[currentIndex].classList.add("active");
}

function showNextImage() {
  currentIndex = (currentIndex + 1) % totalImages;
  updateCarousel();
}

function showPrevImage() {
  currentIndex = (currentIndex - 1 + totalImages) % totalImages;
  updateCarousel();
}

// Auto-rotate every 5 seconds
let autoSlide = setInterval(showNextImage, 5000);

// Manual controls
nextBtn.addEventListener("click", () => {
  showNextImage();
  resetInterval();
});
prevBtn.addEventListener("click", () => {
  showPrevImage();
  resetInterval();
});
indicators.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    currentIndex = index;
    updateCarousel();
    resetInterval();
  });
});

function resetInterval() {
  clearInterval(autoSlide);
  autoSlide = setInterval(showNextImage, 5000);
}

//SEARCH BAR CODE
document.querySelector(".search-icon").addEventListener("click", () => {
  const category = document.querySelector(".category-select").value;
  const searchTerm = document.querySelector(".search-input").value;

  // Save selected category and search input to localStorage
  localStorage.setItem("category", category);
  localStorage.setItem("searchTerm", searchTerm);

  // Redirect to products.html
  window.location.href = "./pages/user/products.html";
});
