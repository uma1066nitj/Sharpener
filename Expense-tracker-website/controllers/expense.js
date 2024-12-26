const Expense = require("../models/expenses");

exports.addexpense = (req, res, next) => {
  const { expenseamount, description, category } = req.body;
  req.user
    .createExpense({ expenseamount, description, category })
    .then((expense) => {
      return res.status(201).json({ expense, success: true });
    })
    .catch((err) => {
      return res.status(403).json({ success: false, error: err });
    });
};

exports.getexpense = (req, res, next) => {
  req.user
    .getExpenses()
    .then((expense) => {
      return res.status(200).json({ expense, success: true });
    })
    .catch((err) => {
      return res.status(402).json({ error: err, success: false });
    });
};

exports.deleteexpense = (req, res, next) => {
  const expenseid = parseInt(req.query.id);
  console.log(expenseid + "expeseid");
  Expense.destroy({ where: { id: expenseid } })
    .then(() => {
      return res
        .status(204)
        .json({ success: true, message: "Deleted Successfuly" });
    })
    .catch((err) => {
      console.log(err);
      return res
        .status(403)
        .json({ success: true, message: "Failed to Delete" });
    });
};
