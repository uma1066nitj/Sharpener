const http = require("http");
const routes = require("./routes");
const hostname = "127.0.0.1";
const port = 4000;
const personName = "Uma Shankar";

const server = http.createServer(routes.handler);
console.log(routes.someText);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
});
