// const http = require("http");
const express = require("express");
const app = express();
const value = 78;
app.use((req, res, next) => {
  console.log("In the middleware");
  next();
});

app.use((req, res, next) => {
  console.log("In another Middleware");
  // res.send("<h1>Hello</h1>");
  res.send({ key1: value });
  // next();
});
// const routes = require("./routes");
const hostname = "127.0.0.1";
const port = 4000;
const personName = "Uma Shankar";

// const server = http.createServer(routes.handler);
// const server = http.createServer(app);

// console.log(routes.someText);

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
// });
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
});
