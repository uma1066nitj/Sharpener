const rootDir = require("../helper/path");
const path = require("path");
exports.getSendFile = (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "contactus.html"));
};

exports.postSendFile = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  console.log(`{Name : ${name}, Email : ${email}}`);
  res.redirect("/success");
};

exports.getSuccess = (req, res) => {
  res.sendFile(path.join(rootDir, "success.html"));
};
