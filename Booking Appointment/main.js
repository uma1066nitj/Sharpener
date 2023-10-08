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
    deleteBtn.className = "delete";
    deleteBtn.appendChild(document.createTextNode("Delete"));
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
    userList.appendChild(li);
  }
  localStorage.setItem(user.email, JSON.stringify(user));

  nameInput.value = "";
  emailInput.value = "";
  contactInput.value = "";

  //delete elements After adding
  var items = userList.getElementsByTagName("li");
  Array.from(items).forEach(function (item) {
    const btn = item.querySelector(".delete");
    btn.addEventListener("click", removeItem);
    function removeItem(e) {
      if (e.target.className == "delete") {
        var item = e.target.parentElement;
        userList.removeChild(item);
        localStorage.removeItem(user.email);
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
