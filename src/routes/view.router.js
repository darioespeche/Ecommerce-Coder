const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");
const CartManager = require("../managers/CartManager");
const pm = new ProductManager();
const cm = new CartManager();
const router = Router();

// Ruta raíz para Handlebars (home.handlebars)
router.get("/", async (req, res) => {
  const products = await pm.getAllBasic();
  res.render("home", { products });
});

// Ruta para view/realtimeproducts
router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { title: "Productos en tiempo real." });
});

// LISTA PAGINADA – GET /view/products
router.get("/products", async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;

  // Filtro
  const filter = {};
  if (query) {
    const [field, value] = query.split(":");
    if (field === "status") filter.status = value === "true";
    else filter[field] = value;
  }

  // Orden
  let sortOpt = {};
  if (sort === "asc") sortOpt.price = 1;
  else if (sort === "desc") sortOpt.price = -1;

  // Paginación
  const skip = (page - 1) * limit;
  const totalDocs = await pm.countDocuments(filter);
  const totalPages = Math.ceil(totalDocs / limit);
  const products = await pm.getFiltered({
    filter,
    sort: sortOpt,
    skip,
    limit: +limit,
  });

  // Construir prev/next
  const base = `/view/products?limit=${limit}&sort=${sort || ""}&query=${
    query || ""
  }`;
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? +page + 1 : null;

  res.render("products/index", {
    title: "Listado de Productos",
    products,
    pagination: {
      page: +page,
      totalPages,
      hasPrevPage: !!prevPage,
      hasNextPage: !!nextPage,
      prevLink: prevPage ? `${base}&page=${prevPage}` : null,
      nextLink: nextPage ? `${base}&page=${nextPage}` : null,
    },
  });
});

// DETALLE DE PRODUCTO – GET /view/products/:pid
router.get("/products/:pid", async (req, res) => {
  const product = await pm.getById(req.params.pid);
  if (!product) return res.status(404).send("Producto no encontrado");
  res.render("products/detail", {
    title: product.title,
    product,
  });
});

//VIEW CARRITO – GET /view/carts/:cid
router.get("/carts/:cid", async (req, res) => {
  const cart = await cm.getCartById(req.params.cid);
  if (!cart) return res.status(404).send("Carrito no encontrado");
  res.render("carts/detail", {
    title: `Carrito ${req.params.cid}`,
    cartId: req.params.cid,
    products: cart.products,
  });
});

module.exports = router;
