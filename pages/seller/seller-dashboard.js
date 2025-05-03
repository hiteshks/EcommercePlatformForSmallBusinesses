import { auth, db } from "../../firebase/firebase-config.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let products = [];
let currentUser = null;

window.showSection = function (sectionId) {
  // Save selected section in localStorage
  localStorage.setItem("activeSection", sectionId);

  // Hide all sections
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => {
    section.style.display = "none";
  });

  // Show selected section
  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = "block";
  }

  // Update active sidebar item
  const navItems = document.querySelectorAll(".sidebar ul li");
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  // Set active class to the clicked item
  const clickedItem = Array.from(navItems).find((item) =>
    item.getAttribute("onclick")?.includes(sectionId)
  );
  if (clickedItem) {
    clickedItem.classList.add("active");
  }
};

// Show confirmation popup
window.showLogoutPopup = function () {
  document.getElementById("logoutOverlay").style.display = "flex";
};

// Hide confirmation popup
window.hideLogoutPopup = function () {
  document.getElementById("logoutOverlay").style.display = "none";
};

window.logout = function () {
  signOut(auth)
    .then(() => {
      window.location.href = "../../index.html";
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      alert("Failed to logout. Please try again.");
    });
};

// Load previously selected section or default to "overview"
document.addEventListener("DOMContentLoaded", () => {
  const savedSection = localStorage.getItem("activeSection") || "overview";
  showSection(savedSection);

  // Show user name in the top bar
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const sellerDocRef = doc(db, "sellers", user.uid);
        const sellerSnap = await getDoc(sellerDocRef);

        if (sellerSnap.exists()) {
          const sellerName = sellerSnap.data().sellerName || "Seller";
          document.getElementById(
            "welcomeUser"
          ).textContent = `Welcome, ${sellerName}`;
        } else {
          document.getElementById(
            "welcomeUser"
          ).textContent = `Welcome, Seller`;
        }
      } catch (error) {
        console.error("Error fetching seller data:", error);
        document.getElementById("welcomeUser").textContent = `Welcome, Seller`;
      }
    }
  });

  // Add Product Form Handling
  const addProductForm = document.getElementById("addProductForm");

  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert("Please log in to add a product.");
        return;
      }

      const sellerId = user.uid;

      // Get form values
      const name = document.getElementById("name").value;
      const description = document.getElementById("description").value;
      const price = parseFloat(document.getElementById("price").value);
      const category = document.getElementById("category").value;
      const subcategory = document.getElementById("subcategory").value;
      const brand = document.getElementById("brand").value;
      const unit = document.getElementById("unit").value;
      const stock = parseInt(document.getElementById("stock").value);
      const imageUrl = document.getElementById("imageUrl").value;
      const location = document.getElementById("location").value;

      const productData = {
        name,
        description,
        price,
        category,
        subcategory,
        brand,
        unit,
        stock,
        imageUrl,
        location,
        sellerId,
      };

      try {
        const { addDoc, collection, serverTimestamp } = await import(
          "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"
        );
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        alert("Product added successfully!");
        addProductForm.reset();
      } catch (err) {
        console.error("Error adding product:", err);
        alert("Failed to add product. Please try again.");
      }
    });

    //Handle reset explicitly if needed
    const resetBtn = addProductForm.querySelector(".reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        addProductForm.reset();
      });
    }
  }
});

//Product page code
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadSellerProducts();
  }
});

async function loadSellerProducts() {
  if (!currentUser || !currentUser.uid) {
    console.error("No logged-in user available.");
    return; // Exit the function if no current user is available
  }
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  const q = query(
    collection(db, "products"),
    where("sellerId", "==", currentUser.uid)
  );
  const querySnapshot = await getDocs(q);

  products = [];
  querySnapshot.forEach((docSnap) => {
    const product = { id: docSnap.id, ...docSnap.data() };
    products.push(product);
    productList.appendChild(renderProductRow(product));
  });
}

function renderProductRow(product) {
  const row = document.createElement("tr");
  row.setAttribute("data-id", product.id);
  row.innerHTML = `
      <td class="editable name" contenteditable="false">${product.name}</td>
      <td class="editable brand" contenteditable="false">${product.brand}</td>
      <td class="editable category" contenteditable="false">${
        product.category
      }</td>
      <td class="editable subcategory" contenteditable="false">${
        product.subcategory
      }</td>
      <td class="editable price" contenteditable="false">${product.price}</td>
      <td class="editable unit" contenteditable="false">${product.unit}</td>
      <td class="editable stock" contenteditable="false">${product.stock}</td>
      <td class="editable location" contenteditable="false">${
        product.location
      }</td>
      <td>${new Date(
        product.createdAt?.seconds * 1000
      ).toLocaleDateString()}</td>
      <td class="editable description" contenteditable="false">${
        product.description
      }</td>
      <td class="editable imageUrl" contenteditable="false">
      <img src="${
        product.imageUrl
      }" alt="product" class="product-image" style="cursor: default" />
      </td>
      <td>
            <div class="action-buttons">
                <button class="edit-btn" onclick="editProduct(this)">Edit</button>
            <button class="save-btn" style="display:none" onclick="saveProduct('${
              product.id
            }')">Save</i></button>
            <button class="cancel-btn" style="display:none" onclick="cancelEdit(this)">Cancel</button>
            <button class="delete-btn" onclick="window.deleteProduct('${product.id.replace(
              /'/g,
              "\\'"
            )}')">Delete</button>
            </div>
          </td>
    `;
  return row;
}

window.resetFilters = function () {
  // Clear all input fields
  document
    .querySelectorAll(".product-search-bar input")
    .forEach((input) => (input.value = ""));

  // Reload all products (replace with your actual load function)
  loadSellerProducts();
};

let oldProductData = {}; // Store the original product data

window.editProduct = function (btn) {
  const row = btn.closest("tr");
  const productId = row.getAttribute("data-id");

  // Store the original data before editing
  const product = products.find((p) => p.id === productId);
  oldProductData[productId] = { ...product }; // Save a copy of the original product data

  // Make cells editable
  row
    .querySelectorAll("td[contenteditable]")
    .forEach((td) => (td.contentEditable = "true"));

  // Add visual highlighting
  row.classList.add("editing-row");

  // Toggle button visibility
  row.querySelector(".edit-btn").style.display = "none";
  row.querySelector(".delete-btn").style.display = "none";
  row.querySelector(".save-btn").style.display = "inline-block";
  row.querySelector(".cancel-btn").style.display = "inline-block";

  const image = row.querySelector(".product-image");
  image.style.cursor = "pointer";
  image.onclick = function () {
    openImageEditModal(image);
  };
};

window.saveProduct = async function (productId) {
  confirmAction(async () => {
    const row = document.querySelector(`tr[data-id='${productId}']`);

    // Get the updated values from the table
    const updatedProduct = {
      name: row.querySelector(".editable.name").textContent.trim(),
      brand: row.querySelector(".editable.brand").textContent.trim(),
      category: row.querySelector(".editable.category").textContent.trim(),
      subcategory: row
        .querySelector(".editable.subcategory")
        .textContent.trim(),
      price: parseFloat(
        row.querySelector(".editable.price").textContent.trim()
      ),
      stock: parseInt(row.querySelector(".editable.stock").textContent.trim()),
      unit: row.querySelector(".editable.unit").textContent.trim(),
      location: row.querySelector(".editable.location").textContent.trim(),
      description: row
        .querySelector(".editable.description")
        .textContent.trim(),
      imageUrl:
        row.getAttribute("data-updated-image-url") ||
        row.querySelector(".editable.imageUrl img").src,

      updatedAt: new Date(), // Update timestamp
    };

    // If image URL is not provided, retain the old one
    if (!updatedProduct.imageUrl) {
      updatedProduct.imageUrl = oldProductData[productId].imageUrl;
    }

    try {
      const { doc, updateDoc } = await import(
        "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"
      );
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, updatedProduct);

      // Remove temporary image URL attribute after successful update
      row.removeAttribute("data-updated-image-url");

      alert("Product updated successfully!");

      // Switch back to read-only mode
      row.querySelectorAll(".editable").forEach((cell) => {
        cell.setAttribute("contenteditable", "false");
      });

      // Disable image editing
      const image = row.querySelector(".product-image");
      image.onclick = null;
      image.style.cursor = "default";

      // Toggle buttons
      row.querySelector(".save-btn").style.display = "none";
      row.querySelector(".cancel-btn").style.display = "none";
      row.querySelector(".edit-btn").style.display = "inline-block";
      row.querySelector(".delete-btn").style.display = "inline-block";

      // Removing Edit Highlight
      row.classList.remove("editing-row");

      // Update the products array to reflect the new data
      const updatedIndex = products.findIndex((p) => p.id === productId);
      products[updatedIndex] = { id: productId, ...updatedProduct };
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again.");
    }
  });
};

window.cancelEdit = function (btn) {
  const row = btn.closest("tr");
  const productId = row.getAttribute("data-id");
  const original = oldProductData[productId];

  if (!original) return;

  // Restore original values
  row.querySelector(".editable.name").textContent = original.name;
  row.querySelector(".editable.brand").textContent = original.brand;
  row.querySelector(".editable.category").textContent = original.category;
  row.querySelector(".editable.subcategory").textContent = original.subcategory;
  row.querySelector(".editable.price").textContent = original.price;
  row.querySelector(".editable.unit").textContent = original.unit;
  row.querySelector(".editable.stock").textContent = original.stock;
  row.querySelector(".editable.location").textContent = original.location;
  row.querySelector(".editable.description").textContent = original.description;

  // Reset image if changed
  const image = row.querySelector(".editable.imageUrl img");
  if (image && original.imageUrl) {
    image.src = original.imageUrl;
  }
  row.removeAttribute("data-updated-image-url");

  // Set fields to non-editable
  row
    .querySelectorAll("td[contenteditable]")
    .forEach((td) => (td.contentEditable = "false"));

  // Disable image editing
  const disImage = row.querySelector(".product-image");
  disImage.onclick = null;
  disImage.style.cursor = "default";

  // Toggle buttons
  row.querySelector(".save-btn").style.display = "none";
  row.querySelector(".cancel-btn").style.display = "none";
  row.querySelector(".edit-btn").style.display = "inline-block";
  row.querySelector(".delete-btn").style.display = "inline-block";

  //To remove the editing hightlight
  row.classList.remove("editing-row");
};

window.deleteProduct = function (id) {
  confirmAction(async () => {
    try {
      const docRef = doc(db, "products", id);
      await deleteDoc(docRef);
      await loadSellerProducts();
      alert("Product deleted successfully.");
    } catch (error) {
      alert("Failed to delete product. Please try again.");
    }
  });
};

// Function to show modal and confirm action
window.confirmAction = function (callback) {
  const modal = document.getElementById("modalOverlay");
  modal.style.display = "flex"; // Show the modal

  const confirmBtn = document.getElementById("confirmModalBtn");
  const cancelBtn = document.getElementById("cancelModalBtn");

  // Confirm button click handler
  confirmBtn.onclick = async () => {
    await callback(); // Executes the deletion or other passed-in action
    modal.style.display = "none"; // Hide the modal after the action
  };

  // Cancel button click handler
  cancelBtn.onclick = () => {
    modal.style.display = "none"; // Hide the modal when canceled
  };
};

window.filterProducts = () => {
  const name = document.getElementById("searchName").value.toLowerCase();
  const brand = document.getElementById("searchBrand").value.toLowerCase();
  const cat = document.getElementById("searchCategory").value.toLowerCase();
  const subcat = document
    .getElementById("searchSubcategory")
    .value.toLowerCase();
  const min = Number(document.getElementById("minPrice").value);
  const max = Number(document.getElementById("maxPrice").value);

  const filtered = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(name) &&
      p.brand.toLowerCase().includes(brand) &&
      p.category.toLowerCase().includes(cat) &&
      p.subcategory.toLowerCase().includes(subcat) &&
      (!min || p.price >= min) &&
      (!max || p.price <= max)
    );
  });

  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  filtered.forEach((p) => productList.appendChild(renderProductRow(p)));
};

let editingImageRow = null;
let tempUpdatedImageUrl = null;

window.openImageEditModal = function (imgEl) {
  editingImageRow = imgEl.closest("tr");
  const currentUrl = imgEl.src;

  // Reset modal state
  document.getElementById("oldImagePreview").src = currentUrl;
  document.getElementById("newImageUrlInput").value = "";
  document.getElementById("newImagePreviewWrapper").style.display = "none";
  tempUpdatedImageUrl = null;

  document.getElementById("updateImageUrlBtn").textContent = "Update";
  document.getElementById("imageModalOverlay").style.display = "flex";
};

// Image Modal Cancel button
document.getElementById("cancelImageEditBtn").onclick = () => {
  document.getElementById("imageModalOverlay").style.display = "none";
  tempUpdatedImageUrl = null;
};

// Update/Done button
document.getElementById("updateImageUrlBtn").onclick = () => {
  const btn = document.getElementById("updateImageUrlBtn");
  const url = document.getElementById("newImageUrlInput").value.trim();

  if (btn.textContent === "Update") {
    if (!url) {
      alert("Please enter a URL.");
      return;
    }
    // Preview image
    document.getElementById("newImagePreview").src = url;
    document.getElementById("newImagePreviewWrapper").style.display = "block";
    tempUpdatedImageUrl = url;
    btn.textContent = "Done";
  } else {
    // Apply updated URL to the row visually
    const imgTd = editingImageRow.querySelector(".editable.imageUrl img");
    imgTd.src = tempUpdatedImageUrl;

    // Store new URL in a data attribute for later use in save
    editingImageRow.setAttribute("data-updated-image-url", tempUpdatedImageUrl);

    document.getElementById("imageModalOverlay").style.display = "none";
  }
};
