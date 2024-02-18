const express = require("express");
const bodyParser = require("body-parser");
const UserController = require("./controllers/userController");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/api/users", UserController.addUser);
app.delete("/api/users/:userId", UserController.deleteUser);
app.get("/api/users", UserController.getAllUsers);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
