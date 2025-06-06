// src/managers/CartManager.js
const Cart = require("../models/Cart");

class CartManager {
  constructor() {
    // No necesitamos filePath
  }

  // 1) Crear un carrito nuevo (vacío)
  async createCart() {
    const newCart = new Cart({ products: [] });
    return await newCart.save(); // devuelve el carrito completo con su _id
  }

  // 2) Obtener un carrito por ID, poblado con datos completos de producto
  async getCartById(cid) {
    // .populate('products.product') trae el documento completo del Product
    return await Cart.findById(cid).populate("products.product").lean();
  }

  // 3) Agregar un producto al carrito (o incrementar cantidad si ya existe)
  async addProductToCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    // Verificar si ya existe el producto en el array
    const existingIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid
    );

    if (existingIndex < 0) {
      // Si no existe, lo empujamos con quantity=1
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      // Si ya existía, incrementamos la cantidad
      cart.products[existingIndex].quantity += 1;
    }

    await cart.save();
    // Volvemos a poblar para devolver datos completos
    return await Cart.findById(cid).populate("products.product").lean();
  }

  // 4) Eliminar un producto específico del carrito (DELETE /api/carts/:cid/products/:pid)
  async removeProductFromCart(cid, pid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid
    );
    await cart.save();
    return await Cart.findById(cid).populate("products.product").lean();
  }

  // 5) Reemplazar TODOS los productos del carrito (PUT /api/carts/:cid)
  //    newProductsArray := [ { product: productId, quantity: X }, … ]
  async updateCartProducts(cid, newProductsArray) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    // Asignamos directamente la lista nueva (puedes añadir validaciones aquí)
    cart.products = newProductsArray.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    await cart.save();
    return await Cart.findById(cid).populate("products.product").lean();
  }

  // 6) Actualizar SOLO la cantidad de un producto en el carrito (PUT /api/carts/:cid/products/:pid)
  async updateProductQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    const existing = cart.products.find(
      (item) => item.product.toString() === pid
    );
    if (!existing) return null;

    existing.quantity = quantity;
    await cart.save();
    return await Cart.findById(cid).populate("products.product").lean();
  }

  // 7) Vaciar completamente el carrito (DELETE /api/carts/:cid)
  async clearCart(cid) {
    const cart = await Cart.findById(cid);
    if (!cart) return null;

    cart.products = [];
    await cart.save();
    return await Cart.findById(cid).populate("products.product").lean();
  }
}

module.exports = CartManager;
