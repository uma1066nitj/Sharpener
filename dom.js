const headerTitle = document.getElementById("header-title");
headerTitle.innerText = "Hello World";

const header = document.getElementById("main-header");
header.style.borderBottom = "solid 3px #000";

const title = document.querySelector(".title");
title.style.fontWeight = "bold";
title.style.color = "green";

const items = document.getElementsByClassName("list-group-item");
console.log(items);
items.style.fontWeight = "bold";
items[2].style.backgroundColor = "green";
