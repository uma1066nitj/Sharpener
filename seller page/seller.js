const myForm = document.querySelector("#my-form");
const expenseInput = document.querySelector("#expense");
const productInput = document.querySelector("#product-name");
const categoryInput = document.querySelector("#category");
const itemListsContainer = document.querySelector("#item-lists");

myForm.addEventListener("submit", onSubmit);

window.addEventListener("DOMContentLoaded", () => {
  showItemFromCrudCrud();
});

async function onSubmit(e) {
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

    // addItemToCrudCrud(item);
    const addedItem = await addItemToCrudCrud(item);

    if (addedItem) {
      const li = createItemElement(addedItem);
      const list = itemListsContainer.querySelector(
        `.${addedItem.category.toLowerCase()}`
      );
      if (list) {
        list.appendChild(li);
      }
    }

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
// function addItemToCrudCrud(item) {
//   axios
//     .post(
//       "https://crudcrud.com/api/428e21483a314774a90fcb59dda1980c/itemList",
//       item
//     )
//     .then(() => {
//       showItemFromCrudCrud();
//     })
//     .catch((err) => console.log(err));
// }
async function addItemToCrudCrud(item) {
  try {
    const response = await axios.post(
      "https://crudcrud.com/api/366dc6e2ccff41d8a47d1c5f0cd5682c/itemList",
      item
    );
    return response.data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// function getDataFromCrudCrud() {
//   return axios
//     .get("https://crudcrud.com/api/428e21483a314774a90fcb59dda1980c/itemList")
//     .then((res) => res.data)
//     .catch((err) => {
//       console.log(err);
//       return [];
//     });
// }
//Async - Await
async function getDataFromCrudCrud() {
  try {
    const res = await axios.get(
      "https://crudcrud.com/api/366dc6e2ccff41d8a47d1c5f0cd5682c/itemList"
    );
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

// async function showItemFromCrudCrud() {
//   try {
//     const items = await getDataFromCrudCrud();

//     itemListsContainer
//       .querySelectorAll("ul")
//       .forEach((ul) => (ul.innerHTML = ""));

//     items.forEach((item) => {
//       const li = createItemElement(item);
//       const list = itemListsContainer.querySelector(
//         `.${item.category.toLowerCase()}`
//       );
//       if (list) {
//         list.appendChild(li);
//       }
//     });
//   } catch (error) {
//     console.error("Error while showing items:", error);
//   }
// }

//Async Await
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
// function removeItem(userId) {
//   axios
//     .delete(
//       `https://crudcrud.com/api/428e21483a314774a90fcb59dda1980c/itemList/${userId}`
//     )
//     .then(() => {
//       showItemFromCrudCrud();
//     })
//     .catch((err) => console.log(err));
// }

// Async-Await
async function removeItem(userId) {
  try {
    await axios.delete(
      `https://crudcrud.com/api/366dc6e2ccff41d8a47d1c5f0cd5682c/itemList/${userId}`
    );
    await showItemFromCrudCrud();
  } catch (err) {
    console.log(err);
  }
}
