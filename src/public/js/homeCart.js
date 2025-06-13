// public/js/homeCart.js
document.addEventListener("DOMContentLoaded", async () => {
  const countEl = document.getElementById("cartCount");
  const viewBtn = document.getElementById("viewCartBtn");
  const cartId = localStorage.getItem("cartId");

  if (!countEl || !viewBtn) return;

  if (!cartId) {
    countEl.textContent = "No tienes carrito activo.";
    viewBtn.style.pointerEvents = "none";
    viewBtn.style.opacity = "0.5";
    return;
  }

  try {
    const res = await fetch(`/api/carts/${cartId}`);
    const json = await res.json();

    if (json.success) {
      const cantidad = json.payload.length;
      countEl.textContent = `Tienes ${cantidad} artículo${
        cantidad !== 1 ? "s" : ""
      } en el carrito.`;
      viewBtn.href = `/view/carts/${cartId}`;
    } else {
      countEl.textContent = "Carrito no encontrado.";
      viewBtn.style.pointerEvents = "none";
      viewBtn.style.opacity = "0.5";
    }
  } catch (err) {
    countEl.textContent = "Error al cargar carrito.";
    console.error(err);
  }
});
