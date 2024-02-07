const db = require("../util/database");

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute(
      "INSERT INTO products (title,price,description, imageUrl) VALUES (?,?,?,?)",
      [this.title, this.price, this.description, this.imageUrl]
    );
  }

  // static deleteproductByid(id) {
  //   return db.execute("Delete Table products where id = ?", [id]);
  // }
  static deleteproductByid(id) {
    if (!id) {
      return Promise.reject(new Error("Product ID is required."));
    }

    return db.execute("DELETE FROM products WHERE id = ?", [id]);
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findbyId(id) {
    return db.execute("SELECT * FROM products WHERE id = ?", [id]);
  }
};
