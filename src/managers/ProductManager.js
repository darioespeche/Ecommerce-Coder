// src/managers/ProductManager.js
const Product = require("../models/Product");

class ProductManager {
  constructor() {
    // No necesitamos filePath: MongoDB se encarga de la persistencia.
  }

  // 1) Obtener todos los productos (sin filtros, paginación o sort)
  async getAllBasic() {
    return await Product.find().lean();
  }

  // 2) Obtener un producto por su ID de Mongo
  async getById(id) {
    // .lean() devuelve un objeto JavaScript simple en lugar de un documento Mongoose
    return await Product.findById(id).lean();
  }

  // 3) Agregar un nuevo producto
  async addProduct(data) {
    // data debe contener: title, description, code, price, status?, stock, category, thumbnails?
    const newProd = new Product({
      title: data.title,
      description: data.description,
      code: data.code,
      price: data.price,
      status: data.status !== undefined ? data.status : true,
      stock: data.stock,
      category: data.category,
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
    });
    return await newProd.save(); // devuelve el documento completo
  }

  // 4) Actualizar un producto (por ID). No permite cambiar el _id ni el code por duplicado
  async updateProduct(id, updatedFields) {
    // Borramos cualquier intento de modificar _id o crear un duplicado de code:
    delete updatedFields._id;
    delete updatedFields.id;

    // Si quisieras bloquear cambios de “code” si ya existe otro con el mismo valor,
    // podrías verificar antes con Product.findOne({ code: updatedFields.code, _id: { $ne: id } }), etc.
    const updated = await Product.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    }).lean();

    return updated; // null si no existía
  }

  // 5) Eliminar un producto por ID
  async deleteProduct(id) {
    const result = await Product.findByIdAndDelete(id);
    return result !== null; // true si se eliminó, false si no existía
  }

  // 6) Contar total de documentos según un filtro
  async countDocuments(filter = {}) {
    return await Product.countDocuments(filter);
  }

  // 7) Obtener productos filtrados / paginados / ordenados
  //    Usar este método desde el router para el GET /api/products con limit/page/sort/query
  async getFiltered({ filter = {}, sort = {}, skip = 0, limit = 10 }) {
    return await Product.find(filter).sort(sort).skip(skip).limit(limit).lean();
  }
}

module.exports = ProductManager;
