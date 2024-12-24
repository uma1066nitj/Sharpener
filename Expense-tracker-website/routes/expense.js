const express = require("express");

const expenseControlller = require("../controllers/expense");
const userauthentication = require("../middleware/auth");

const router = express.Router();

router.post(
  "/addexpenses",
  userauthentication.authenticate,
  expenseControlller.addexpense
);

router.get(
  "/getexpense",
  userauthentication.authenticate,
  expenseControlller.getexpense
);

router.delete(
  "/deleteexpense/:expenseId",
  userauthentication.authenticate,
  expenseControlller.deleteexpense
);

module.exports = router;
