const headerTitle = document.getElementById("header-title");
// headerTitle.innerText = "Hello World";

const header = document.getElementById("main-header");
header.style.borderBottom = "solid 3px #000";

const title = document.querySelector(".title");
title.style.fontWeight = "bold";
title.style.color = "green";

// const items = document.getElementsByClassName("list-group-item");
// // console.log(items.style);

// for (let i = 0; i < items.length; i++) {
//   items[i].style.fontWeight = "bold";
// }
// items[2].style.backgroundColor = "green";

// const li = document.getElementsByTagName("li");
// // console.log(li);
// for (let i = 0; i < li.length; i++) {
//   li[i].style.fontWeight = "bold";
//   li[i].style.backgroundColor = "skyblue";
// }

// const secondItem = document.querySelector(".list-group-item:nth-child(2)");
// console.log(items);
// secondItem.style.backgroundColor = "green";
// const thirdItem = document.querySelector(".list-group-item:nth-child(3)");
// console.log(items);
// thirdItem.style.display = "none";

// const odd = document.querySelectorAll("li:nth-child(odd)");
// const even = document.querySelectorAll("li:nth-child(even)");
// // console.log(list);
// even[0].style.color = "green";
// for (let i = 0; i < odd.length; i++) {
//   odd[i].style.backgroundColor = "green";
//   even[i].style.backgroundColor = "grey";
// }

//Traversing DOM

// const itemList = document.querySelector("#items");
//ParentNode
// console.log(itemList.parentNode);
// itemList.parentNode.style.backgroundColor = "#f4f4f4";

//ParentElement
// console.log(itemList.parentElement);
// itemList.parentElement.style.backgroundColor = "#f4f4f4";

//childnode
// console.log(itemList.childNodes);

//children
// console.log(itemList.children);

//firstchild
// console.log(itemList.firstChild);

//firstElementChild
// console.log(itemList.firstElementChild);

//lastElementChild
// console.log(itemList.lastElementChild);
// itemList.lastElementChild.textContent = "Hello 4";

//nextSibling
// console.log(itemList.nextSibling);

//nextElementSibling
// console.log(itemList.nextElementSibling);

//previousSibling
// console.log(itemList.previousSibling);

//previousElementSibling
// console.log(itemList.previousElementSibling);

//CreateElement

//create a div
// var newDiv = document.createElement("div");
// //add class
// newDiv.className = "hello";
// //add id
// newDiv.id = "hello1";
// //add attributes
// newDiv.setAttribute("title", "Hello Div");

// //create a text node
// var newDivText = document.createTextNode("Hello World");

// //add text to div
// newDiv.appendChild(newDivText);

// var contianer = document.querySelector("header .container");
// var h1 = document.querySelector("header h1");

// contianer.insertBefore(newDiv, h1);
// console.log(newDiv);

// newDiv.style.fontSize = "30px";

//add hello world before item 1
var newDiv = document.createElement("div");
//add class
newDiv.className = "hello";
//add id
newDiv.id = "hello1";
//add attributes
newDiv.setAttribute("title", "Hello Div");

//create a text node
var newDivText = document.createTextNode("Hello World");

//add text to div
newDiv.appendChild(newDivText);

var contianer = document.querySelector(".list-group");
const item1 = document.querySelector("#items").firstElementChild;
// console.log(contianer);
contianer.insertBefore(newDiv, item1);
