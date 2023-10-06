const headerTitle = document.getElementById("header-title");
headerTitle.innerText = "Hello World";

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

const odd = document.querySelectorAll("li:nth-child(odd)");
const even = document.querySelectorAll("li:nth-child(even)");
// console.log(list);
even[0].style.color = "green";
for (let i = 0; i < odd.length; i++) {
  odd[i].style.backgroundColor = "green";
  even[i].style.backgroundColor = "grey";
}
