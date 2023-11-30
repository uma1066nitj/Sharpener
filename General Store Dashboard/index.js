const myForm = document.querySelector("#my-form");
const itemInput = document.querySelector("#item");
const descriptionInput = document.querySelector("#description");
const priceInput = document.querySelector("#price");
const quantityInput = document.querySelector("#quantity");
const itemList = document.querySelector("#item-list");

myForm.addEventListener("submit", onSubmit);

window.addEventListener("DOMContentLoaded", () => {
  showItemFromCrudCrud();
});

function onSubmit(e) {
  e.preventDefault();

  if (
    itemInput.value === "" ||
    descriptionInput.value === "" ||
    priceInput.value === "" ||
    quantityInput === ""
  ) {
    alert("Please enter all values");
  } else {
    const item = {
      itemName: itemInput.value,
      description: descriptionInput.value,
      price: priceInput.value,
      quantity: quantityInput.value,
    };
    const li = createItemElement(item);
    itemList.appendChild(li);

    addItemToCrudCrud(item);

    itemInput.value = "";
    descriptionInput.value = "";
    priceInput.value = "";
    quantityInput.value = "";
  }
}

function createItemElement(item) {
  const li = document.createElement("li");
  const buy1Button = createButton("Buy 1", "buy1");
  const buy2Button = createButton("Buy 2", "buy2");
  const buy3Button = createButton("Buy 3", "buy3");
  const itemDetails = document.createTextNode(
    `Item Name: ${item.itemName}, Description: ${item.description}, Price: ${item.price}, Quantity: ${item.quantity}`
  );

  li.appendChild(itemDetails);
  li.appendChild(buy1Button);
  li.appendChild(buy2Button);
  li.appendChild(buy3Button);

  buy1Button.addEventListener("click", () => buyThing(1, item));
  buy2Button.addEventListener("click", () => buyThing(2, item));
  buy3Button.addEventListener("click", () => buyThing(3, item));
  return li;
}
function createButton(text, className) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.textContent = text;
  return btn;
}
function addItemToCrudCrud(item) {
  axios
    .post(
      "https://crudcrud.com/api/d1fb14dc75de4c39934ec921b24e436a/itemList",
      item
    )
    .then(() => {
      showItemFromCrudCrud();
    })
    .catch((err) => console.log(err));
}
function getDataFromCrudCrud() {
  return axios
    .get("https://crudcrud.com/api/d1fb14dc75de4c39934ec921b24e436a/itemList")
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return [];
    });
}
async function showItemFromCrudCrud() {
  try {
    const items = await getDataFromCrudCrud();

    itemList.innerHTML = "";

    items.forEach((item) => {
      const li = createItemElement(item);
      if (li instanceof Node) {
        // Checking if 'li' is a Node before appending
        itemList.appendChild(li);
      }
    });
  } catch (error) {
    console.error("Error while showing items:", error);
  }
}

async function buyThing(quantityToBuy, SelectedItem) {
  const items = await getDataFromCrudCrud();
  let updatedQuantity;
  const updatedItems = items.map((item) => {
    if (item._id === SelectedItem._id) {
      updatedQuantity = parseInt(item.quantity) - quantityToBuy;
      return { ...item, quantity: updatedQuantity };
    }
    return item;
  });
  await axios
    .patch(
      `https://crudcrud.com/api/d1fb14dc75de4c39934ec921b24e436a/itemList/${SelectedItem._id}`,
      { quantity: updatedQuantity }
    )
    .then(() => {
      showItemFromCrudCrud();
    })
    .catch((err) => console.log(err));
}
