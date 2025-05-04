import { auth, db } from "../../firebase/firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let userCart = [];
let currentUser = null;
let userWishlist = [];
let detailedCartItems = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not logged in – redirect to homepage
    window.location.href = "../../index.html";
    return;
  }

  // User is logged in
  currentUser = user;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      userCart = userData.cart || [];
      userWishlist = userData.wishlist || [];

      await fetchCartProductDetails(userCart);

      console.log("User Cart:", userCart);
      console.log("Detailed Cart Items:", detailedCartItems);
      //console.log("User Wishlist:", userWishlist);
      // Optional: renderCart(userCart);

      renderCartItems(detailedCartItems);
      calculatePriceDetails();
    } else {
      console.warn("User document does not exist in Firestore.");
    }
  } catch (error) {
    console.error("Error retrieving user cart:", error);
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
      window.location.href = "../../index.html";
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

//Favourite button interaction
document.getElementById("favorite-btn").addEventListener("click", function () {
  //Using sessionStorage
  sessionStorage.setItem("userWishlist", JSON.stringify(userWishlist));
  window.location.href = "./products.html";
});

async function fetchCartProductDetails(cart) {
  const promises = [];

  for (let item of cart) {
    const productId = Object.keys(item)[0];
    const quantity = item[productId]; // in case you want to store quantity

    const productRef = doc(db, "products", productId);
    const productPromise = getDoc(productRef).then((docSnap) => {
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: productId, quantity };
      } else {
        console.warn(`Product with ID ${productId} not found`);
        return null;
      }
    });

    promises.push(productPromise);
  }

  const results = await Promise.all(promises);
  detailedCartItems = results.filter((item) => item !== null); // remove failed fetches
  console.log("Detailed Cart Items:", detailedCartItems);

  // Optional: renderCart(detailedCartItems);
}

//Rendering cart items
function renderCartItems(items) {
  const cartList = document.getElementById("cart-items-list");
  cartList.innerHTML = ""; // Clear previous

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "cart-card";

    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" />

      <div class="cart-card-details">
        <div class="cart-product-name">${item.name}</div>
        <div class="cart-product-description">${item.description}</div>
        <div class="cart-meta">
          <span><strong>Unit:</strong> ${item.unit}</span>
          <span><strong>Brand:</strong> ${item.brand}</span>
        </div>
        <div class="cart-price">₹${item.price}</div>
        
       <div class="cart-actions">
        <div class="quantity-selector" data-id="${item.id}">
            <button class="qty-btn qty-decrease">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn qty-increase">+</button>
        </div>
        <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    cartList.appendChild(card);
  });
}

function calculatePriceDetails() {
  let productTotal = 0;

  for (let item of detailedCartItems) {
    productTotal += item.price * item.quantity;
  }

  const deliveryFee = productTotal > 0 ? 50 : 0;
  const total = productTotal + deliveryFee;

  document.getElementById("product-total").textContent = `₹${productTotal}`;
  document.getElementById("total-amount").textContent = `₹${total}`;

  // Update delivery fee text in DOM
  const deliverySpan = document.querySelector(
    "#price-details-card .price-line:nth-child(3) span:last-child"
  );
  if (deliverySpan) {
    deliverySpan.textContent = `₹${deliveryFee}`;
  }
}

document
  .getElementById("place-order-btn")
  .addEventListener("click", async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);

      await updateDoc(userRef, { cart: [] });

      alert("Order placed successfully!");

      // Clear local state
      userCart = [];
      detailedCartItems = [];

      // Re-render empty cart
      renderCartItems([]);
      calculatePriceDetails();
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  });
