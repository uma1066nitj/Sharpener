var form = document.getElementById("addForm");
var itemList = document.getElementById("items");

//form submit event
form.addEventListener("submit", addItem);

//remove item
itemList.addEventListener("click", removeItem);

//addItem Function
function addItem(e) {
  e.preventDefault();

  var newItem = document.getElementById("item").value;

  //create new Element li
  var li = document.createElement("li");
  //add classname
  li.className = "list-group-item";

  li.appendChild(document.createTextNode(newItem));

  //add delete button
  var deleteBtn = document.createElement("button");

  //add className
  deleteBtn.className = "btn btn-danger btn-sm float-right delete";
  deleteBtn.appendChild(document.createTextNode("X"));

  li.appendChild(deleteBtn);

  itemList.appendChild(li);
}

//remove item
function removeItem(e) {
  if (e.target.classList.contains("delete")) {
    if (confirm("Are you sure?")) {
      var li = e.target.parentElement;
      itemList.removeChild(li);
    }
  }
}
