const socket = io();
console.log("Intentando conectar con Socket.IO…");

// 3) Función para pintar la lista en el <ul id="productsList">
function renderProducts(products) {
  const ul = document.getElementById("productsList");
  if (!ul) {
    console.warn("⚠️ No encontré el UL #productsList");
    return;
  }

  if (!Array.isArray(products) || products.length === 0) {
    ul.innerHTML = "<li>No hay productos aún.</li>";
    return;
  }

  ul.innerHTML = products
    .map(
      (p) => `<li>ID ${p._id} — ${p.title} — $${p.price} — [${p.category}]</li>`
    )
    .join("");
}

// 4) Al conectar, escuchar la lista inicial
socket.on("allProducts", (prods) => {
  console.log("🔄 Cliente recibió lista inicial:", prods);
  renderProducts(prods);
});

// 5) Escuchar actualizaciones posteriores
socket.on("productListUpdated", (prods) => {
  console.log("🔄 Cliente recibió lista actualizada:", prods);
  renderProducts(prods);
});

// 6) Handler del formulario “Crear producto”
const addForm = document.getElementById("addProductForm");
if (addForm) {
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);

    const newProductData = {
      title: formData.get("title"),
      description: formData.get("description"),
      code: formData.get("code"),
      price: parseFloat(formData.get("price")),
      status: true,
      stock: parseInt(formData.get("stock")),
      category: formData.get("category"),
      thumbnails: formData.get("thumbnails")
        ? formData
            .get("thumbnails")
            .split(",")
            .map((s) => s.trim())
        : [],
    };

    console.log("📤 Cliente emite createProduct con:", newProductData);
    socket.emit("createProduct", newProductData);
    addForm.reset();
  });
} else {
  console.warn("⚠️ No encontré el <form id='addProductForm'>");
}

// 7) Handler del formulario “Eliminar producto”
const deleteForm = document.getElementById("deleteProductForm");
if (deleteForm) {
  deleteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // NO usar parseInt: Mongo espera un string de 24 hex.
    const pid = deleteForm.pid.value.trim();
    if (!pid) {
      console.warn("⚠️ ID de producto vacío en deleteProductForm");
      return;
    }
    console.log("📤 Cliente emite removeProduct con ID:", pid);
    socket.emit("removeProduct", pid);
    deleteForm.reset();
  });
} else {
  console.warn("⚠️ No encontré el <form id='deleteProductForm'>");
}
