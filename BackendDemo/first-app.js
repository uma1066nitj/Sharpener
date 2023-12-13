// // const http = require("http");
// const express = require("express");
// const app = express();
// const value = 78;
// app.use((req, res, next) => {
//   console.log("In the middleware");
//   next();
// });

// app.use((req, res, next) => {
//   console.log("In another Middleware");
//   // res.send("<h1>Hello</h1>");
//   res.send({ key1: value });
//   // next();
// });
// // const routes = require("./routes");
const hostname = "127.0.0.1";
const port = 4000;
const personName = "Uma Shankar";

// // const server = http.createServer(routes.handler);
// // const server = http.createServer(app);

// // console.log(routes.someText);

// // server.listen(port, hostname, () => {
// //   console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
// // });
// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
// });

const express = require("express");
const app = express();
const bodyPraser = require("body-parser");
const routerAdmin = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyPraser.urlencoded({ extended: false }));

app.use("/admin", routerAdmin);
app.use(shopRoutes);

app.use((req, res, next) => {
  res.status(404).send("<h1>Page Not Found</h1>");
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
});
