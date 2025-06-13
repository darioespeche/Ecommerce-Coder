// public/js/cart.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("cart.js cargado");

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pid = btn.dataset.pid;
      console.log("Añadiendo producto:", pid);

      let cartId = localStorage.getItem("cartId");
      if (!cartId) {
        const res1 = await fetch("/api/carts", { method: "POST" });
        const j1 = await res1.json();
        if (!j1.success) {
          console.error("Error creando carrito:", j1.error);
          return alert("No pude crear el carrito");
        }
        cartId = j1.payload._id;
        localStorage.setItem("cartId", cartId);
      }

      const res2 = await fetch(`/api/carts/${cartId}/product/${pid}`, {
        method: "POST",
      });
      const j2 = await res2.json();
      if (j2.success) {
        alert("Producto agregado al carrito 🎉");
      } else {
        alert("Error agregando producto: " + j2.error);
      }
    });
  });
});

document.querySelectorAll(".remove-from-cart").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const pid = btn.dataset.pid;
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return alert("No hay carrito activo");

    const res = await fetch(`/api/carts/${cartId}/product/${pid}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      alert("Producto eliminado del carrito");
      location.reload();
    } else {
      alert("Error: " + json.error);
    }
  });
});

// Botón para vaciar el carrito
const clearBtn = document.getElementById("clear-cart");
if (clearBtn) {
  clearBtn.addEventListener("click", async () => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) return alert("No hay carrito activo");

    const res = await fetch(`/api/carts/${cartId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      alert("Carrito vaciado");
      localStorage.removeItem("cartId");
      location.reload();
    } else {
      alert("Error: " + json.error);
    }
  });
}
