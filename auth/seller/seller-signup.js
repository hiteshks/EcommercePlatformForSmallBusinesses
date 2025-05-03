import { auth, db } from "../../firebase/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const signupForm = document.getElementById("seller-signup-form");
const errorMessage = document.getElementById("error-message");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("seller-name").value.trim();
  const email = document.getElementById("seller-email").value.trim();
  const password = document.getElementById("seller-password").value;

  errorMessage.style.display = "none";
  errorMessage.textContent = "";

  try {
    // Step 1: Check if email is already registered
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.length > 0) {
      errorMessage.textContent =
        "This email is already registered. Please log in instead.";
      errorMessage.style.display = "block";
      return;
    }

    // Step 2: Create new auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Step 3: Create seller profile in Firestore
    const sellerRef = doc(db, "sellers", user.uid);

    await setDoc(sellerRef, {
      sellerName: name,
      email: email,
      createdAt: new Date().toISOString(),
    });

    // Step 4: Redirect to seller dashboard or show success
    alert("Seller account created successfully! Redirecting to login...");
    window.location.href = "./seller-login.html";
  } catch (err) {
    errorMessage.textContent = err.message;
    errorMessage.style.display = "block";
    console.error("Signup Error:", err);
  }
});
