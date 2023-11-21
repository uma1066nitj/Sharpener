// var form = document.getElementById("addForm");
// var itemList = document.getElementById("items");

// //form submit event
// form.addEventListener("submit", addItem);

// //remove item
// itemList.addEventListener("click", removeItem);

// //Filter Item
// filter.addEventListener("keyup", filterItems);

// //addItem Function
// function addItem(e) {
//   e.preventDefault();

//   var newItem =
//     document.getElementById("item").value +
//     " " +
//     document.getElementById("description").value;

//   //create new Element li
//   var li = document.createElement("li");
//   //add classname
//   li.className = "list-group-item";

//   li.appendChild(document.createTextNode(newItem));

//   //add delete button
//   var deleteBtn = document.createElement("button");

//   //add className
//   deleteBtn.className = "btn btn-danger btn-sm float-right delete";
//   deleteBtn.appendChild(document.createTextNode("X"));
//   li.appendChild(deleteBtn);

//   //add edit button
//   var editBtn = document.createElement("button");
//   editBtn.className = "btn btn-sm float-right edit";
//   editBtn.appendChild(document.createTextNode("Edit"));
//   li.appendChild(editBtn);

//   itemList.appendChild(li);
// }

// //remove item
// function removeItem(e) {
//   if (e.target.classList.contains("delete")) {
//     if (confirm("Are you sure?")) {
//       var li = e.target.parentElement;
//       itemList.removeChild(li);
//     }
//   }
// }

// function filterItems(e) {
//   //convert text to lowercase
//   var text = e.target.value.toLowerCase();
//   //get list
//   var items = itemList.getElementsByTagName("li");
//   //   console.log(items);
//   //convert to array
//   Array.from(items).forEach(function (item) {
//     var itemName = item.firstChild.textContent;
//     if (itemName.toLowerCase().indexOf(text) != -1) {
//       item.style.display = "block";
//     } else {
//       item.style.display = "none";
//     }
//   });
// }
