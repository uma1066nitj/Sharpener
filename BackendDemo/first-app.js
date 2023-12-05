const http = require("http");

const hostname = "127.0.0.1";
const port = 4000;
const personName = "Uma Shankar";

const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === "/home") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>Home Page</title></head>");
    res.write("<body><h1>Welcome home</h1></body>");
    res.write("</html>");
    return res.end();
  } else if (url === "/about") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>About Page</title></head>");
    res.write("<body><h1>Welcome to About Us page</h1></body>");
    res.write("</html>");
    return res.end();
  } else if (url === "/node") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>Node.js Project</title></head>");
    res.write("<body><h1>Welcome to my Node Js project</h1></body>");
    res.write("</html>");
    return res.end();
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/ by ${personName}`);
});
