const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = (req, res, next) => {
  const { name, email, phone, password } = req.body;
  console.log(req.body);
  const saltrounds = 10;
  bcrypt.genSalt(saltrounds, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        console.log("unable to create new user");
        res.json({ message: "unable to create new user" });
      }
      User.create({ name, email, phone, password: hash })
        .then(() => {
          res.status(201).json({ message: "successfully created new user" });
        })
        .catch((err) => {
          res.status(403).json({ sucess: false, error: err });
          console.log("error " + err.message);
        });
    });
  });
};

function generateAccessToken(id) {
  return jwt.sign(id, process.env.TOCKEN_SECRET);
}
exports.loginUser = (req, res, next) => {
  const { email, password } = req.body;
  console.log(password);
  User.findAll({ where: { email } }).then((user) => {
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, function (err, response) {
        if (err) {
          console.log(err);
          return res.json({
            success: false,
            message: "Something went wrong",
          });
        }
        if (response) {
          console.log(JSON.stringify(user));
          const jwttoken = generateAccessToken(user[0].id);
          return res.status(200).json({
            token: jwttoken,
            success: true,
            message: "Successfully Logged In",
          });
        } else {
          // response is OutgoingMessage object that server response http request
          return res
            .status(401)
            .json({ success: false, message: "passwords do not match" });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "passwords do not match" });
    }
  });
};
