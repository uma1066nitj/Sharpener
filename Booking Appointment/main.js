const myForm = document.querySelector("#my-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const contactInput = document.querySelector("#contact");
const msg = document.querySelector(".msg");
const userList = document.querySelector("#users");

myForm.addEventListener("submit", onSubmit);

function onSubmit(e) {
  e.preventDefault();

  if (
    nameInput.value === "" ||
    emailInput.value === " " ||
    contactInput.value === " "
  ) {
    msg.classList.add("error");
    msg.innerHTML = "Please enter all values";

    setTimeout(() => msg.remove(), 3000);
  } else {
    const li = document.createElement("li");
    const deleteBtn = document.createElement("button");
    const editBtn = document.createElement("button");

    deleteBtn.className = "delete";
    editBtn.className = "edit";
    deleteBtn.appendChild(document.createTextNode("Delete"));
    editBtn.appendChild(document.createTextNode("Edit"));
    li.appendChild(
      document.createTextNode(
        `Name : ${nameInput.value}, Email : ${emailInput.value}, Contact: ${contactInput.value}`
      )
    );
    class User {
      constructor(name, email, contact) {
        this.name = name;
        this.email = email;
        this.contact = contact;
      }
    }
    var user = new User(nameInput.value, emailInput.value, contactInput.value);

    li.appendChild(deleteBtn);
    li.appendChild(editBtn);
    userList.appendChild(li);
  }
  localStorage.setItem(user.email, JSON.stringify(user));

  nameInput.value = "";
  emailInput.value = "";
  contactInput.value = "";

  //delete elements After adding
  var items = userList.getElementsByTagName("li");
  Array.from(items).forEach(function (item) {
    const deleteButton = item.querySelector(".delete");
    const editButton = item.querySelector(".edit");
    deleteButton.addEventListener("click", removeItem);
    editButton.addEventListener("click", editItem);
    function removeItem(e) {
      if (e.target.className == "delete") {
        var item = e.target.parentElement;
        userList.removeChild(item);
        localStorage.removeItem(user.email);
      }
    }
    function editItem(e) {
      if (e.target.className == "edit") {
        var item = e.target.parentElement;
        userList.removeChild(item);
        localStorage.removeItem(user.email);
        nameInput.value = user.name;
        emailInput.value = user.email;
        contactInput.value = user.contact;
      }
    }
  });
}
// let users = { userList };
// console.log(users);

// storing objects with local storage
// let myObj = { name: "Domenic", age: 56 };

// let myObj_seralized = JSON.stringify(myObj);
// localStorage.setItem("myObj", myObj_seralized);

// let myObj_deseralized = JSON.parse(localStorage.getItem("myObj"));
// console.log(myObj_deseralized);
