// src/routes/products.router.js
const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");
const pm = new ProductManager();

module.exports = function (io) {
  const router = Router();

  // Cuando un cliente se conecta por WebSocket:
  io.on("connection", async (socket) => {
    console.log("⚡️ Cliente WS conectado en products.router:", socket.id);

    try {
      // Antes usábamos pm.getAll(), pero ahora el método se llama getAllBasic()
      const allProducts = await pm.getAllBasic();
      socket.emit("allProducts", allProducts);
    } catch (err) {
      console.error("Error leyendo productos:", err);
      socket.emit("error", { message: "No se pudo cargar la lista inicial." });
    }

    // Escuchar creación de producto por WebSocket
    socket.on("createProduct", async (prodData) => {
      console.log("🔥 Servidor recibió createProduct:", prodData);
      try {
        await pm.addProduct(prodData);
        const updated = await pm.getAllBasic();
        console.log("📡 Emitiendo productListUpdated:", updated);
        io.emit("productListUpdated", updated);
      } catch (err) {
        console.error("Error al crear producto:", err);
        socket.emit("error", { message: "No se pudo crear el producto." });
      }
    });

    // Escuchar eliminación de producto por WebSocket
    socket.on("removeProduct", async (pid) => {
      console.log("🔥 Servidor recibió removeProduct, ID:", pid);
      try {
        const deleted = await pm.deleteProduct(pid);
        if (deleted) {
          console.log("🗑️ Producto borrado:", pid);
          const updated = await pm.getAllBasic();
          io.emit("productListUpdated", updated);
        } else {
          socket.emit("error", { message: `Producto ${pid} no encontrado.` });
        }
      } catch (err) {
        console.error("Error al eliminar producto:", err);
        socket.emit("error", { message: "No se pudo eliminar el producto." });
      }
    });
  });

  // GET /api/products?limit=&page=&sort=&query=
  router.get("/", async (req, res) => {
    try {
      let { limit, page, sort, query } = req.query;
      limit = parseInt(limit) || 10;
      page = parseInt(page) || 1;

      // Construimos el filtro
      let filter = {};
      if (query) {
        const [field, value] = query.split(":");
        if (field && value !== undefined) {
          if (field === "status") {
            filter.status = value === "true";
          } else if (field === "price") {
            filter.price = Number(value);
          } else {
            filter[field] = value;
          }
        }
      }

      // Construimos sort
      let sortOption = {};
      if (sort === "asc") sortOption.price = 1;
      else if (sort === "desc") sortOption.price = -1;

      const skip = (page - 1) * limit;
      const totalDocs = await pm.countDocuments(filter);
      const totalPages = Math.ceil(totalDocs / limit);

      const products = await pm.getFiltered({
        filter,
        sort: sortOption,
        skip,
        limit,
      });

      // Construir enlaces prev/next
      const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
      const makeLink = (p) => {
        if (p < 1 || p > totalPages) return null;
        const qs = [];
        if (limit) qs.push(`limit=${limit}`);
        if (sort) qs.push(`sort=${sort}`);
        if (query) qs.push(`query=${encodeURIComponent(query)}`);
        qs.push(`page=${p}`);
        return `${baseUrl}?${qs.join("&")}`;
      };
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      return res.json({
        status: "success",
        payload: products,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage: prevPage !== null,
        hasNextPage: nextPage !== null,
        prevLink: prevPage ? makeLink(prevPage) : null,
        nextLink: nextPage ? makeLink(nextPage) : null,
      });
    } catch (err) {
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // GET /api/products/:pid
  router.get("/:pid", async (req, res) => {
    try {
      const product = await pm.getById(req.params.pid);
      if (!product) {
        return res
          .status(404)
          .json({ status: "error", error: "Producto no encontrado" });
      }
      return res.json({ status: "success", payload: product });
    } catch (err) {
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // POST /api/products
  router.post("/", async (req, res) => {
    try {
      const newProd = await pm.addProduct(req.body);
      const allProducts = await pm.getAllBasic();
      io.emit("productListUpdated", allProducts);
      return res.status(201).json({ status: "success", payload: newProd });
    } catch (err) {
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // PUT /api/products/:pid
  router.put("/:pid", async (req, res) => {
    try {
      const updated = await pm.updateProduct(req.params.pid, req.body);
      if (!updated) {
        return res
          .status(404)
          .json({ status: "error", error: "Producto no encontrado" });
      }
      const allProducts = await pm.getAllBasic();
      io.emit("productListUpdated", allProducts);
      return res.json({ status: "success", payload: updated });
    } catch (err) {
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  // DELETE /api/products/:pid
  router.delete("/:pid", async (req, res) => {
    try {
      const deleted = await pm.deleteProduct(req.params.pid);
      if (!deleted) {
        return res
          .status(404)
          .json({ status: "error", error: "Producto no encontrado" });
      }
      const allProducts = await pm.getAllBasic();
      io.emit("productListUpdated", allProducts);
      return res.json({ status: "success", message: "Producto eliminado" });
    } catch (err) {
      return res.status(500).json({ status: "error", error: err.message });
    }
  });

  return router;
};
