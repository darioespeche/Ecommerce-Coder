// src/db.js
const mongoose = require("mongoose");

// Puedes leer la URL desde una variable de entorno o dejarla fija en desarrollo:
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB:", MONGO_URI);
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
