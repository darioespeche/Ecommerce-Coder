// src/models/Product.js
const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] },
  },
  {
    timestamps: true, // opcional: crea createdAt y updatedAt
  }
);

const Product = model("Product", productSchema);
module.exports = Product;
