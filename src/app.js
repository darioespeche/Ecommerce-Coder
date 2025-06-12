const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;

// 1) Conectar a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB Atlas:", err);
    process.exit(1);
  });

// 2) Configurar Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// 3) Archivos estáticos y JSON
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 4) Importar routers (pasando `io` a los que lo requieran)
const viewRouter = require("./routes/view.router");
const productsRouter = require("./routes/products.router")(io);
const cartsRouter = require("./routes/carts.router");

// 5) Montar routers:
app.use("/view", viewRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// 6) 404 genérico
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint no encontrado" });
});

// 7) Levantar el servidor HTTP + Socket.IO
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/view`);
});
