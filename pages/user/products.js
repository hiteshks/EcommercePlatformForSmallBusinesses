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
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global Array to store filtered products
let filteredProducts = [];
let currentUserId = null;
let userWishlist = [];
let showFavoritesOnly = false;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    getUserWishlist(currentUserId); // Fetch wishlist
    const guestButtons = document.getElementById("guest-buttons");
    const userMenu = document.getElementById("user-menu");
    guestButtons.classList.add("hidden");
    userMenu.classList.remove("hidden");
  } else {
    currentUserId = null;
    const guestButtons = document.getElementById("guest-buttons");
    const userMenu = document.getElementById("user-menu");
    guestButtons.classList.remove("hidden");
    userMenu.classList.add("hidden");
  }
});

async function getUserWishlist(userId) {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (userDoc.exists()) {
    userWishlist = userDoc.data().wishlist || [];
    renderProductGrid(); // Re-render with wishlist state
  }
}

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

window.addEventListener("load", async () => {
  const categorySelect = document.querySelector(".category-select");
  const searchInput = document.querySelector(".search-input");

  // Check localStorage
  let category = localStorage.getItem("category");
  let searchTerm = localStorage.getItem("searchTerm");

  if (category && searchTerm) {
    categorySelect.value = category;
    searchInput.value = searchTerm;

    await performSearch(category, searchTerm);
    localStorage.removeItem("category");
    localStorage.removeItem("searchTerm");
  } else {
    // Use current dropdown/input values
    category = categorySelect.value;
    searchTerm = searchInput.value;

    if (!searchTerm.trim()) {
      // Only reload once if empty
      if (!sessionStorage.getItem("hasReloaded")) {
        sessionStorage.setItem("hasReloaded", "true");
        location.reload();
        return;
      } else {
        sessionStorage.removeItem("hasReloaded");
        console.warn("Reloaded once already — avoiding infinite reload.");
        return;
      }
    }

    await performSearch(category, searchTerm);
  }
});

async function performSearch(category, searchTerm) {
  const productsRef = collection(db, "products");
  const lowerTerm = searchTerm.trim().toLowerCase();

  let q;
  if (category === "All Categories") {
    q = query(productsRef);
  } else {
    q = query(productsRef, where("subcategory", "==", category));
  }

  try {
    const querySnapshot = await getDocs(q);

    // Reset the global array to store full product details
    filteredProducts = [];

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productWithId = { id: doc.id, ...product };

      // If search term is empty, include all products matching category
      if (
        !lowerTerm ||
        product.name?.toLowerCase().includes(lowerTerm) ||
        product.brand?.toLowerCase().includes(lowerTerm)
      ) {
        filteredProducts.push(productWithId);
      }
    });

    console.log("Matching Products:", filteredProducts);
  } catch (error) {
    console.error("Error searching products:", error);
  }

  populateBrandFilters(filteredProducts);
  renderProductGrid(filteredProducts);
}

document.querySelector(".search-icon").addEventListener("click", () => {
  const category = document.querySelector(".category-select").value;
  const searchTerm = document.querySelector(".search-input").value;

  performSearch(category, searchTerm);
});

//To populate the filter sidebar
function populateBrandFilters(filteredProducts) {
  const brandSet = new Set();

  // Iterate over product objects, not IDs.
  filteredProducts.forEach((product) => {
    if (product.brand) {
      brandSet.add(product.brand);
    }
  });

  const brandContainer = document.getElementById("brand-filter-options");
  brandContainer.innerHTML = ""; // clear previous options

  Array.from(brandSet)
    .sort()
    .forEach((brand) => {
      const label = document.createElement("label");
      label.innerHTML = `<input type="checkbox" name="brandFilter" value="${brand}"> ${brand}`;
      brandContainer.appendChild(label);
      brandContainer.appendChild(document.createElement("br"));
    });
}

async function renderProductGrid(products) {
  if (!Array.isArray(products)) {
    console.warn("Expected an array of products but got:", products);
    return;
  }

  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  // 🔹 Fetch user cart before rendering
  let userCart = [];
  if (currentUserId) {
    const userRef = doc(db, "users", currentUserId);
    const userSnap = await getDoc(userRef);
    const rawCart = userSnap.data()?.cart || [];
    userCart = Array.isArray(rawCart) ? rawCart : [];
  }

  toggleCartButtonColor(userCart.length > 0);

  products.forEach((product) => {
    const isWishlisted = userWishlist.includes(product.id);
    const card = document.createElement("div");
    card.className = "product-card";

    const cartItem = userCart.find((item) => item[product.id] !== undefined);
    const quantityInCart = cartItem ? cartItem[product.id] : 0;

    card.innerHTML = `
        <div class="product-image-wrapper">
          <img src="${product.imageUrl}" alt="${product.name}" />
          <div class="wishlist-button ${
            isWishlisted ? "active" : ""
          }">&#10084;</div>
        </div>
        <div class="product-details">
          <div class="product-name">${product.name}</div>
          <div class="product-price">₹${product.price}</div>
        </div>
        <div class="cart-btn-container"></div>
      `;

    // Navigate to product page
    card.addEventListener("click", () => {
      window.location.href = `product.html?id=${product.id}`;
    });

    // Wishlist toggle
    const wishlistBtn = card.querySelector(".wishlist-button");
    wishlistBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!currentUserId) {
        alert("Please log in to manage your wishlist.");
        return;
      }

      wishlistBtn.classList.toggle("active");

      if (wishlistBtn.classList.contains("active")) {
        await addToWishlist(currentUserId, product.id);
        userWishlist.push(product.id);
      } else {
        await removeFromWishlist(currentUserId, product.id);
        userWishlist = userWishlist.filter((id) => id !== product.id);
      }
    });

    const container = card.querySelector(".cart-btn-container");

    if (quantityInCart > 0) {
      renderQuantitySelector(container, product, quantityInCart);
    } else {
      container.innerHTML = `<button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>`;
      const addToCartBtn = container.querySelector(".add-to-cart-btn");

      addToCartBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!currentUserId) {
          alert("Please log in to add items to cart.");
          return;
        }

        renderQuantitySelector(container, product, 1);
        await updateUserCart(product.id, 1);
        await updateProductStock(product.id, 1);
      });
    }

    grid.appendChild(card);
  });
}

function renderQuantitySelector(container, product, initialQty) {
  container.innerHTML = `
      <div class="quantity-selector">
        <button class="qty-btn decrement">-</button>
        <span class="qty-value">${initialQty}</span>
        <button class="qty-btn increment">+</button>
      </div>
    `;

  const decrementBtn = container.querySelector(".decrement");
  const incrementBtn = container.querySelector(".increment");
  const qtyValue = container.querySelector(".qty-value");

  let quantity = initialQty;

  async function updateQuantity(change) {
    const newQty = quantity + change;
    if (newQty < 0 || newQty > 5) return;

    decrementBtn.disabled = true;
    incrementBtn.disabled = true;
    decrementBtn.classList.add("disabled");
    incrementBtn.classList.add("disabled");

    try {
      if (change === 1) await updateProductStock(product.id, 1);
      if (change === -1) await updateProductStock(product.id, -1);
      quantity = newQty;

      if (quantity === 0) {
        container.innerHTML = `<button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>`;
        const btn = container.querySelector("button");
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          renderQuantitySelector(container, product, 1);
          await updateUserCart(product.id, 1);
          await updateProductStock(product.id, 1);
        });
        await updateUserCart(product.id, 0); // remove from cart
        return;
      }

      qtyValue.textContent = quantity;
      await updateUserCart(product.id, quantity);
    } catch (err) {
      console.error("Failed to update cart or stock", err);
    } finally {
      decrementBtn.disabled = false;
      incrementBtn.disabled = false;
      decrementBtn.classList.remove("disabled");
      incrementBtn.classList.remove("disabled");
    }
  }

  decrementBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    updateQuantity(-1);
  });

  incrementBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    updateQuantity(1);
  });
}

async function addToWishlist(userId, productId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    wishlist: arrayUnion(productId),
  });
}

async function removeFromWishlist(userId, productId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    wishlist: arrayRemove(productId),
  });
}

document.getElementById("favorite-btn").addEventListener("click", function () {
  showFavoritesOnly = !showFavoritesOnly;

  // Toggle button color
  this.style.color = showFavoritesOnly ? "#ea526f" : ""; // Revert to default when toggled off

  // Filter and render products
  if (showFavoritesOnly) {
    const favProducts = filteredProducts.filter((product) =>
      userWishlist.includes(product.id)
    );
    renderProductGrid(favProducts);
  } else {
    renderProductGrid(filteredProducts);
  }
});

document.getElementById("applyFiltersBtn").addEventListener("click", () => {
  // Get selected price ranges
  const selectedPrices = Array.from(
    document.querySelectorAll('input[name="priceRange"]:checked')
  ).map((input) => input.value);

  // Get selected brands
  const selectedBrands = Array.from(
    document.querySelectorAll('input[name="brandFilter"]:checked')
  ).map((input) => input.value.toLowerCase());

  const filtered = filteredProducts.filter((product) => {
    let priceMatch = true;
    let brandMatch = true;

    // --- PRICE FILTER ---
    if (selectedPrices.length > 0) {
      priceMatch = selectedPrices.some((range) => {
        if (range === "2000+") return product.price >= 2000;

        const [min, max] = range.split("-").map(Number);
        return product.price >= min && product.price <= max;
      });
    }

    // --- BRAND FILTER ---
    if (selectedBrands.length > 0) {
      brandMatch = selectedBrands.includes(product.brand.toLowerCase());
    }

    return priceMatch && brandMatch;
  });

  renderProductGrid(filtered);
});

document.getElementById("resetFiltersBtn").addEventListener("click", () => {
  // Uncheck all checkboxes in the sidebar
  document
    .querySelectorAll('#filter-sidebar input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));

  // Show all products again
  renderProductGrid(filteredProducts);
});

// Firestore functions
// Firestore functions
async function updateUserCart(productId, quantity) {
  const userRef = doc(db, "users", currentUserId);
  const userSnap = await getDoc(userRef);

  const rawCart = userSnap.data().cart || []; // Default to empty array if no cart exists
  const cart = [...rawCart]; // Create a shallow copy of the cart array

  // Find if the product is already in the cart
  const productIndex = cart.findIndex((item) => item[productId] !== undefined);

  if (productIndex > -1) {
    // If product is already in the cart, update its quantity
    if (quantity <= 0) {
      // If quantity <= 0, remove product from cart
      cart.splice(productIndex, 1);
    } else {
      // Update the quantity of the product in cart
      cart[productIndex][productId] = quantity;
    }
  } else {
    // If product is not in the cart, add it with the given quantity
    if (quantity > 0) {
      cart.push({ [productId]: quantity });
    }
  }

  // Update the user's cart in Firestore
  await updateDoc(userRef, { cart: cart });

  // Update the cart button color based on whether the cart is empty or not
  toggleCartButtonColor(cart.length > 0);
}

async function updateProductStock(productId, delta) {
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);
  const stock = productSnap.data().stock || 0;
  await updateDoc(productRef, { stock: stock - delta });
}

// Change cart-btn color based on cart content
function toggleCartButtonColor(hasItems) {
  const cartBtn = document.getElementById("cart-btn");
  if (!cartBtn) return;

  if (hasItems) {
    // Change the button color when cart is not empty
    cartBtn.style.color = "#219ebc";
  } else {
    // Revert to the original button color when cart is empty
    cartBtn.style.color = ""; // Or use the original color you prefer
  }
}

document.addEventListener("DOMContentLoaded", () => {
  //fetching user wishlist from session storage if available
  let userWishlistFromSession =
    JSON.parse(sessionStorage.getItem("userWishlist")) || [];
  console.log("user wishlist from session storage", userWishlistFromSession);

  if (userWishlistFromSession) {
    showFavoritesOnly = true;
    // Toggle button color

    document.getElementById("favorite-btn").style.color = showFavoritesOnly
      ? "#ea526f"
      : "";

    // Filter and render products
    if (showFavoritesOnly) {
      performSearch("All Categories", "").then(() => {
        console.log(
          "filtered products after perforem search",
          filteredProducts
        );
        const favProducts = filteredProducts.filter((product) =>
          userWishlistFromSession.includes(product.id)
        );
        console.log("favProducts", favProducts);
        renderProductGrid(favProducts);
      });
    } else {
      console.log("in else");
      renderProductGrid(filteredProducts);
    }
  } else {
    alert("No products in wishlist!");
  }
});
