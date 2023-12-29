const hostname = "127.0.0.1";
const port = 4000;
const personName = "Uma Shankar";

const express = require("express");
const app = express();
const bodyPraser = require("body-parser");
const routerAdmin = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const contactRoutes = require("./routes/contactus");
const path = require("path");

app.use(bodyPraser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", routerAdmin);
app.use(shopRoutes);
app.use(contactRoutes);

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
});
