import { auth, db } from "../../firebase/firebase-config.js";

import {
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const signupForm = document.getElementById("signup-form");
const errorMessage = document.getElementById("error-message");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupForm["name"].value.trim();
  const email = signupForm["email"].value.trim();
  const password = signupForm["password"].value;

  try {
    // Step 1: Check if email already exists
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    if (signInMethods.length > 0) {
      errorMessage.textContent = "Account already exists. Please login.";
      errorMessage.style.display = "block";
      return;
    }

    // Step 2: Create new user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Step 3: Save user info to Firestore
    const userData = {
      name,
      email,
      wishlist: [],
      cart: [],
      orders: [],
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", uid), userData);

    // Redirect or notify success
    alert("Account created successfully! Redirecting to login...");
    window.location.href = "./user-login.html";
  } catch (err) {
    errorMessage.textContent = err.message;
    errorMessage.style.display = "block";
  }
});
