const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");
const pm = new ProductManager();
const router = Router();

// Ruta raíz para Handlebars (home.handlebars)
router.get("/", async (req, res) => {
  const products = await pm.getAllBasic();
  res.render("home", { products });
});

// Ruta para /realtimeproducts
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

module.exports = router;
