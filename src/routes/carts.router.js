// routes/carts.router.js
const { Router } = require("express");
const CartManager = require("../managers/CartManager");

const router = Router();
const cartManager = new CartManager();

//1- POST /api/carts/  → crea un carrito nuevo
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ success: true, payload: newCart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2- GET /api/carts/:cid  → lista productos de un carrito
router.get("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;

    const cart = await cartManager.getCartById(cid);

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, error: "Carrito no encontrado" });
    }

    return res.json({ success: true, payload: cart.products });
  } catch (err) {
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, error: "ID de carrito inválido" });
    }

    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3- POST /api/carts/:cid/product/:pid  → agrega un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    // Llamo al método que agrega o incrementa quantity
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, error: "Carrito no encontrado" });
    }
    res.status(200).json({ success: true, payload: updatedCart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// 4- DELETE /api/carts/:cid/product/:pid  → elimina un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;

    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, error: "Carrito no encontrado" });
    }
    return res.status(200).json({ success: true, payload: updatedCart });
  } catch (err) {
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, error: "ID de carrito o producto inválido" });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5) PUT /api/carts/:cid  → reemplaza TODO el array de productos
router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const newProducts = req.body.products;
    if (!Array.isArray(newProducts)) {
      return res.status(400).json({
        success: false,
        error: "Envía un array 'products' en el body",
      });
    }

    const updatedCart = await cartManager.updateCartProducts(cid, newProducts);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, error: "Carrito no encontrado" });
    }
    return res.status(200).json({ success: true, payload: updatedCart });
  } catch (err) {
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, error: "ID de carrito inválido" });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});
// 6) PUT /api/carts/:cid/product/:pid  → actualiza la cantidad de un producto
router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Envía un número válido para 'quantity'",
      });
    }

    const updatedCart = await cartManager.updateProductQuantity(
      cid,
      pid,
      quantity
    );
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, error: "Carrito o producto no encontrado" });
    }
    return res.status(200).json({ success: true, payload: updatedCart });
  } catch (err) {
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, error: "ID de carrito o producto inválido" });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});
// 7) DELETE /api/carts/:cid  → vacía el carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;

    const updatedCart = await cartManager.clearCart(cid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, error: "Carrito no encontrado" });
    }
    return res.status(200).json({ success: true, payload: updatedCart });
  } catch (err) {
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res
        .status(400)
        .json({ success: false, error: "ID de carrito inválido" });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
