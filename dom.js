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

const li = document.getElementsByTagName("li");
// console.log(li);
for (let i = 0; i < li.length; i++) {
  li[i].style.fontWeight = "bold";
  li[i].style.backgroundColor = "skyblue";
}
