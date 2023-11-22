const myForm = document.querySelector("#my-form");
const expenseInput = document.querySelector("#expense");
const productInput = document.querySelector("#product-name");
const categoryInput = document.querySelector("#category");
const itemListsContainer = document.querySelector("#item-lists");

myForm.addEventListener("submit", onSubmit);

window.addEventListener("DOMContentLoaded", () => {
  showItemFromCrudCrud();
});

function onSubmit(e) {
  e.preventDefault();

  if (
    expenseInput.value === "" ||
    productInput.value === "" ||
    categoryInput.value === ""
  ) {
    alert("Please enter all values");
  } else {
    const item = {
      expense: expenseInput.value,
      product: productInput.value,
      category: categoryInput.value,
    };
    // const li = createItemElement(item);
    // if (li.className === "electronics") {
    //   itemListOfElectronic.appendChild(li);
    //   // console.log("hhhhhhhhhhhhhhhhhhhhhhh")
    // } else if (li.className === "food") {
    //   itemListOfFood.appendChild(li);
    // } else {
    //   itemListOfSkincare.appendChild(li);
    // }
    addItemToCrudCrud(item);

    expenseInput.value = "";
    productInput.value = "";
    categoryInput.selectedIndex = 0;
  }
}

function createItemElement(item) {
  const li = document.createElement("li");

  const deleteBtn = createButton("Delete", "delete");
  const itemDetails = document.createTextNode(
    `Expense: ${item.expense}, Product: ${item.product}, Category: ${item.category}`
  );

  li.appendChild(itemDetails);
  li.appendChild(deleteBtn);

  deleteBtn.addEventListener("click", () => removeItem(item._id));
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
      "https://crudcrud.com/api/dd61109a517446519d858b405ae84301/itemList",
      item
    )
    .then(() => {
      showItemFromCrudCrud();
    })
    .catch((err) => console.log(err));
}
function getDataFromCrudCrud() {
  return axios
    .get("https://crudcrud.com/api/dd61109a517446519d858b405ae84301/itemList")
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return [];
    });
}
async function showItemFromCrudCrud() {
  try {
    const items = await getDataFromCrudCrud();

    itemListsContainer
      .querySelectorAll("ul")
      .forEach((ul) => (ul.innerHTML = ""));

    items.forEach((item) => {
      const li = createItemElement(item);
      const list = itemListsContainer.querySelector(
        `.${item.category.toLowerCase()}`
      );
      if (list) {
        list.appendChild(li);
      }
    });
  } catch (error) {
    console.error("Error while showing items:", error);
  }
}
function removeItem(userId) {
  axios
    .delete(
      `https://crudcrud.com/api/dd61109a517446519d858b405ae84301/itemList/${userId}`
    )
    .then(() => {
      showItemFromCrudCrud();
    })
    .catch((err) => console.log(err));
}
