import { auth } from "../../firebase/firebase-config.js";
import {
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const loginForm = document.getElementById("seller-login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("seller-email").value.trim();
  const password = document.getElementById("seller-password").value;

  errorMessage.style.display = "none";
  errorMessage.textContent = "";

  try {
    // Attempt login
    await signInWithEmailAndPassword(auth, email, password);

    // Redirect on successful login
    window.location.href = "../../pages/seller/seller-dashboard.html";
  } catch (error) {
    console.error("Login Error:", error.code);
    let msg = "An error occurred. Please try again.";

    switch (error.code) {
      case "auth/user-not-found":
        msg = "Seller account not found. Please sign up.";
        break;
      case "auth/wrong-password":
        msg = "Incorrect password.";
        break;
      case "auth/invalid-email":
        msg = "Invalid email format.";
        break;
      case "auth/too-many-requests":
        msg = "Too many login attempts. Please try again later.";
        break;
    }

    errorMessage.textContent = msg;
    errorMessage.style.display = "block";
  }
});
