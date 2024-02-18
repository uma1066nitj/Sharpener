const myForm = document.querySelector("#my-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const contactInput = document.querySelector("#contact");
const msg = document.querySelector(".msg");
const userList = document.querySelector("#users");

myForm.addEventListener("submit", onSubmit);

window.addEventListener("DOMContentLoaded", () => {
  // showUsersFromLocalStorage();
  showUsersFromServer();
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

    addUserToServer(user);

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

  deleteBtn.addEventListener("click", () => removeItem(user.id));
  // editBtn.addEventListener("click", () => editItem(user));

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
function addUserToServer(user) {
  axios
    .post("http://localhost:3000/api/users", user)
    .then(() => {
      showUsersFromServer();
      // console.log(res.data);
    })
    .catch((err) => console.log(err));
}

// function getFromLocalStorage() {
//   const usersString = localStorage.getItem("users");
//   return usersString ? JSON.parse(usersString) : [];
// }
// function getDataFromCrudCrud() {
//   return axios
//     .get(
//       "https://crudcrud.com/api/be271b50e17f4e9bb176f99cc01661cf/appointmentData"
//     )
//     .then((res) => res.data)
//     .catch((err) => {
//       console.log(err);
//       return [];
//     });
// }

// function showUsersFromLocalStorage() {
//   const users = getFromLocalStorage();
//   users.forEach((user) => {
//     const li = createUserElement(user);
//     userList.appendChild(li);
//   });
// }

async function showUsersFromServer() {
  userList.innerHTML = "";
  axios
    .get("http://localhost:3000/api/users")
    .then((res) => {
      const users = res.data;
      users.forEach((user) => {
        const li = createUserElement(user);
        userList.appendChild(li);
      });
    })
    .catch((err) => {
      console.log(err);
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
    .delete(`http://localhost:3000/api/users/${userId}`)
    .then(() => {
      showUsersFromServer();
    })
    .catch((err) => console.log(err));
}

// function editItem(user) {
//   nameInput.value = user.name;
//   emailInput.value = user.email;
//   contactInput.value = user.contact;
//   removeItem(user._id);
//   myForm.addEventListener("submit", (e) => {
//     e.preventDefault();

//     if (
//       nameInput.value === "" ||
//       emailInput.value === "" ||
//       contactInput.value === ""
//     ) {
//       displayMessage("Please enter all values", "error");
//     } else {
//       const updatedUser = {
//         name: nameInput.value,
//         email: emailInput.value,
//         contact: contactInput.value,
//       };

//       axios
//         .patch(
//           `https://crudcrud.com/api/be271b50e17f4e9bb176f99cc01661cf/appointmentData/${user._id}`,
//           updatedUser
//         )
//         .then(() => {
//           showUsersFromCrudCrud();
//         })
//         .catch((err) => console.log(err));

//       nameInput.value = "";
//       emailInput.value = "";
//       contactInput.value = "";
//     }
//   });
//   // removeItem(user.email);
// }
