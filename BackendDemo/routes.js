const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === "/") {
    const message = fs
      .readFileSync("message", "utf-8")
      .split("\n")
      .filter(Boolean);

    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>Enter Message</title></head>");
    res.write("<body>");
    res.write("<div><h2>Previous Message</h2>");
    if (message.length === 0) {
      res.write("<p>No message yet</p>");
    } else {
      res.write("<ul>");
      message.forEach((msg) => {
        res.write(`<li>${msg}</li>`);
      });
      res.write("</ul>");
    }
    res.write("</div>");
    res.write(
      '<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>'
    );

    res.write("</body></html>");
    return res.end();
  }
  if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split("=")[1];
      fs.appendFileSync("message", message + "\n");
    });

    res.writeHead(302, { location: "/" });
    return res.end();
  }
  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head><title>Node.js Project</title></head>");
  res.write("<body><h1>Welcome to my Node Js project</h1></body>");
  res.write("</html>");
  res.end();
};

// module.exports = requestHandler;

// module.exports = {
//   handler: requestHandler,
//   someText: "Some hard coded text",
// };

// module.exports.handler = requestHandler;
// module.exports.someText = "some hard coded text";

exports.handler = requestHandler;
exports.someText = "some hard coded text";
