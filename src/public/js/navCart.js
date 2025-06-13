// public/js/navCart.js
document.addEventListener("DOMContentLoaded", async () => {
  const countEl = document.getElementById("nav-cart-count");
  const linkEl = document.getElementById("nav-cart-link");

  // Si no hay carrito en localStorage, lo deshabilitamos
  let cartId = localStorage.getItem("cartId");
  if (!cartId) {
    countEl.textContent = "0";
    linkEl.style.opacity = "0.5";
    linkEl.href = "#";
    return;
  }

  try {
    const res = await fetch(`/api/carts/${cartId}`);
    const json = await res.json();

    if (json.success) {
      const count = json.payload.reduce((sum, p) => sum + p.quantity, 0);
      countEl.textContent = count;
      linkEl.href = `/view/carts/${cartId}`;
    } else {
      // Si el carrito ya no existe por algún motivo
      countEl.textContent = "0";
      linkEl.style.opacity = "0.5";
      linkEl.href = "#";
    }
  } catch (err) {
    console.error("Error cargando carrito en nav:", err);
    countEl.textContent = "?";
    linkEl.style.opacity = "0.5";
    linkEl.href = "#";
  }
});
