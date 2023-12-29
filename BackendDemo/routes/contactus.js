const express = require("express");
const path = require("path");
const router = express.Router();
const rootDir = require("../helper/path");

router.get("/contactus", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "contactus.html"));
});
router.post("/contactus", (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  console.log(`{Name : ${name}, Email : ${email}}`);
  res.redirect("/success");
});

router.get("/success", (req, res) => {
  res.sendFile(path.join(rootDir, "success.html"));
});
module.exports = router;
