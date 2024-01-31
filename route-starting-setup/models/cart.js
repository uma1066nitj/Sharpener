const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    //fetch the previous cart
    let cart = { products: [], totalPrie: 0 };
    fs.readFile(p, (err, fileContent) => {
      if (!err) {
        if (fileContent.length > 0) {
          try {
            // Parse the JSON data
            cart = JSON.parse(fileContent);
          } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
          }
        }
      }
    });
    //analyze the cart => find existing product

    const existingProductIndex = cart.products.findIndex(
      (prod) => prod.id === id
    );
    const existingProduct = cart.products[existingProductIndex];
    let updatedProduct;
    //add new product / increase quantity
    if (existingProduct) {
      updatedProduct = { ...existingProduct };
      updatedProduct.qty = updatedProduct.qty + 1;
      cart.products = [...cart.products];
      cart.products[existingProductIndex] = updatedProduct;
    } else {
      updatedProduct = { id: id, qty: 1 };
      cart.products = [...cart.products, updatedProduct];
    }
    cart.totalPrie = cart.totalPrie + productPrice;
    fs.writeFile(p, JSON.stringify(cart), (err) => {
      console.log(err);
    });
  }
};
