// const myForm = document.querySelector("#my-form");
// const nameInput = document.querySelector("#name");
// const emailInput = document.querySelector("#email");
// const contactInput = document.querySelector("#contact");
// const msg = document.querySelector(".msg");
// const userList = document.querySelector("#users");

// myForm.addEventListener("submit", onSubmit);

// window.addEventListener("DOMContentLoaded", () => {
//     showUserOnScreen(userDetailsObj);
//   }
// });

// function onSubmit(e) {
//   e.preventDefault();

//   if (
//     nameInput.value === "" ||
//     emailInput.value === " " ||
//     contactInput.value === " "
//   ) {
//     msg.classList.add("error");
//     msg.innerHTML = "Please enter all values";

//     setTimeout(() => msg.remove(), 3000);
//   } else {
//     const li = document.createElement("li");
//     const deleteBtn = document.createElement("button");
//     const editBtn = document.createElement("button");

//     deleteBtn.className = "delete";
//     editBtn.className = "edit";
//     deleteBtn.appendChild(document.createTextNode("Delete"));
//     editBtn.appendChild(document.createTextNode("Edit"));
//     li.appendChild(
//       document.createTextNode(
//         `Name : ${nameInput.value}, Email : ${emailInput.value}, Contact: ${contactInput.value}`
//       )
//     );
//     // class User {
//     //   constructor(name, email, contact) {
//     //     this.name = name;
//     //     this.email = email;
//     //     this.contact = contact;
//     //   }
//     // }
//     // var user = new User(nameInput.value, emailInput.value, contactInput.value);
//     const obj = {
//       nameInput,
//       emailInput,
//       contactInput,
//     };

//     li.appendChild(deleteBtn);
//     li.appendChild(editBtn);
//     userList.appendChild(li);
//   }
//   localStorage.setItem(obj.emailInput, JSON.stringify(obj));
//   showUserOnScreen(user);

//   nameInput.value = "";
//   emailInput.value = "";
//   contactInput.value = "";

//   //delete elements After adding
//   var items = userList.getElementsByTagName("li");
//   Array.from(items).forEach(function (item) {
//     const deleteButton = item.querySelector(".delete");
//     const editButton = item.querySelector(".edit");
//     deleteButton.addEventListener("click", removeItem);
//     editButton.addEventListener("click", editItem);
//     function removeItem(e) {
//       if (e.target.className == "delete") {
//         var item = e.target.parentElement;
//         userList.removeChild(item);
//         localStorage.removeItem(user.email);
//       }
//     }
//     function editItem(e) {
//       if (e.target.className == "edit") {
//         var item = e.target.parentElement;
//         userList.removeChild(item);
//         localStorage.removeItem(user.email);
//         nameInput.value = user.name;
//         emailInput.value = user.email;
//         contactInput.value = user.contact;
//       }
//     }
//   });
// }

const myForm = document.querySelector("#my-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const contactInput = document.querySelector("#contact");
const msg = document.querySelector(".msg");
const userList = document.querySelector("#users");

myForm.addEventListener("submit", onSubmit);

window.addEventListener("DOMContentLoaded", () => {
  // showUsersFromLocalStorage();
  showUsersFromCrudCrud();
});

function onSubmit(e) {
  e.preventDefault();

  if (
    nameInput.value === "" ||
    emailInput.value === "" ||
    contactInput.value === ""
  ) {
    displayMessage("Please enter all values", "error");
  } else {
    const user = {
      name: nameInput.value,
      email: emailInput.value,
      contact: contactInput.value,
    };

    const li = createUserElement(user);
    userList.appendChild(li);

    // addToLocalStorage(user);

    addToCrudCrudData(user);

    nameInput.value = "";
    emailInput.value = "";
    contactInput.value = "";
  }
}

function createUserElement(user) {
  const li = document.createElement("li");
  const deleteBtn = createButton("Delete", "delete");
  const editBtn = createButton("Edit", "edit");

  li.appendChild(
    document.createTextNode(
      `Name: ${user.name}, Email: ${user.email}, Contact: ${user.contact}`
    )
  );

  li.appendChild(deleteBtn);
  li.appendChild(editBtn);

  deleteBtn.addEventListener("click", () => removeItem(user._id));
  editBtn.addEventListener("click", () => editItem(user));

  return li;
}

function createButton(text, className) {
  const btn = document.createElement("button");
  btn.className = className;
  btn.appendChild(document.createTextNode(text));
  return btn;
}

function displayMessage(message, className) {
  msg.classList.add(className);
  msg.textContent = message;

  setTimeout(() => {
    msg.classList.remove(className);
    msg.textContent = "";
  }, 3000);
}

// function addToLocalStorage(user) {
//   const users = getFromLocalStorage();
//   users.push(user);
//   localStorage.setItem("users", JSON.stringify(users));
// }
function addToCrudCrudData(user) {
  axios
    .post(
      "https://crudcrud.com/api/be271b50e17f4e9bb176f99cc01661cf/appointmentData",
      user
    )
    .then(() => {
      showUsersFromCrudCrud();
      // console.log(res.data);
    })
    .catch((err) => console.log(err));
}

// function getFromLocalStorage() {
//   const usersString = localStorage.getItem("users");
//   return usersString ? JSON.parse(usersString) : [];
// }
function getDataFromCrudCrud() {
  return axios
    .get(
      "https://crudcrud.com/api/be271b50e17f4e9bb176f99cc01661cf/appointmentData"
    )
    .then((res) => res.data)
    .catch((err) => {
      console.log(err);
      return [];
    });
}

// function showUsersFromLocalStorage() {
//   const users = getFromLocalStorage();
//   users.forEach((user) => {
//     const li = createUserElement(user);
//     userList.appendChild(li);
//   });
// }

async function showUsersFromCrudCrud() {
  userList.innerHTML = "";
  const users = await getDataFromCrudCrud();
  users.forEach((user) => {
    const li = createUserElement(user);
    userList.appendChild(li);
  });
}
// function removeItem(email) {
//   const users = getFromLocalStorage().filter((user) => user.email !== email);
//   localStorage.setItem("users", JSON.stringify(users));
//   userList.innerHTML = "";
//   showUsersFromLocalStorage();
// }

function removeItem(userId) {
  axios
    .delete(
      `https://crudcrud.com/api/be271b50e17f4e9bb176f99cc01661cf/appointmentData/${userId}`
    )
    .then(() => {
      showUsersFromCrudCrud();
    })
    .catch((err) => console.log(err));
}

function editItem(user) {
  nameInput.value = user.name;
  emailInput.value = user.email;
  contactInput.value = user.contact;
  removeItem(user._id);
  myForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (
      nameInput.value === "" ||
      emailInput.value === "" ||
      contactInput.value === ""
    ) {
      displayMessage("Please enter all values", "error");
    } else {
      const updatedUser = {
        name: nameInput.value,
        email: emailInput.value,
        contact: contactInput.value,
      };

      axios
        .patch(
          `https://crudcrud.com/api/be271b50e17f4e9bb176f99cc01661cf/appointmentData/${user._id}`,
          updatedUser
        )
        .then(() => {
          showUsersFromCrudCrud();
        })
        .catch((err) => console.log(err));

      nameInput.value = "";
      emailInput.value = "";
      contactInput.value = "";
    }
  });
  // removeItem(user.email);
}
