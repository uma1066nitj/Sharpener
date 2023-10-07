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
    li.appendChild(
      document.createTextNode(
        `Name : ${nameInput.value}, Email : ${emailInput.value}, Contact: ${contactInput.value}`
      )
    );
    userList.appendChild(li);
    class User {
      constructor(name, email, contact) {
        this.name = name;
        this.email = email;
        this.contact = contact;
      }
    }
    var user = new User(nameInput.value, emailInput.value, contactInput.value);

    localStorage.setItem(user.email, JSON.stringify(user));

    nameInput.value = "";
    emailInput.value = "";
    contactInput.value = "";
  }
}
// let users = { userList };
// console.log(users);

// storing objects with local storage
// let myObj = { name: "Domenic", age: 56 };

// let myObj_seralized = JSON.stringify(myObj);
// localStorage.setItem("myObj", myObj_seralized);

// let myObj_deseralized = JSON.parse(localStorage.getItem("myObj"));
// console.log(myObj_deseralized);
