// const myForm = document.querySelector("#my-form");
// const nameInput = document.querySelector("#name");
// const emailInput = document.querySelector("#email");
// const msg = document.querySelector(".msg");
// const userList = document.querySelector("#users");

// myForm.addEventListener("submit", onSubmit);

// function onSubmit(e) {
//   e.preventDefault();

//   if (nameInput.value === "" || emailInput.value === " ") {
//     msg.classList.add("error");
//     msg.innerHTML = "Please enter all values";

//     setTimeout(() => msg.remove(), 3000);
//   } else {
//     const li = document.createElement("li");
//     li.appendChild(
//       document.createTextNode(`${nameInput.value} : ${emailInput.value}`)
//     );
//     userList.appendChild(li);

//     localStorage.setItem(nameInput.value, emailInput.value);
//     console.log(localStorage.getItem(nameInput.value));
//     nameInput.value = "";
//     emailInput.value = "";
//   }
// }

//storing objects with local storage
let myObj = { name: "Domenic", age: 56 };

let myObj_seralized = JSON.stringify(myObj);
localStorage.setItem("myObj", myObj_seralized);

let myObj_deseralized = JSON.parse(localStorage.getItem("myObj"));
console.log(myObj_deseralized);
