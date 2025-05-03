import { app } from "../../firebase/firebase-config.js";

import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const auth = getAuth(app);

const loginForm = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  try {
    // Sign in the user
    await signInWithEmailAndPassword(auth, email, password);

    // If successful, redirect to user dashboard

    window.location.href = "../../index.html";
  } catch (error) {
    // Handle login errors
    let message = "Login failed. Please try again.";

    if (error.code === "auth/user-not-found") {
      message = "Account does not exist. Please sign up first.";
    } else if (error.code === "auth/wrong-password") {
      message = "Incorrect password. Please try again.";
    } else if (error.code === "auth/invalid-email") {
      message = "Invalid email format.";
    }

    errorMessage.innerText = message;
    errorMessage.style.display = "block";
  }
});
