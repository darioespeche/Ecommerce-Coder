// routes/carts.router.js
const { Router } = require("express");
const CartManager = require("../managers/CartManager");

const router = Router();
const cartManager = new CartManager();

// POST /api/carts/  → crea un carrito nuevo
router.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ success: true, payload: newCart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/carts/:cid  → lista productos de un carrito
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

// POST /api/carts/:cid/product/:pid  → agrega un producto al carrito
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
// DELETE /api/carts/:cid/product/:pid  → elimina un producto del carrito
router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    // No parseInt ni parse a number, sólo la cadena tal cual:
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

// PUT /api/carts/:cid  → actualiza el carrito completo
router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const updatedCart = await cartManager.updateCartProducts(
      cid,
      req.body.products
    );
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
module.exports = router;
