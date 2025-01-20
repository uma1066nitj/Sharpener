const Expense = require("../models/expenses");
const User = require("../models/user");

exports.addexpense = (req, res, next) => {
  const { expenseamount, description, category } = req.body;

  // Add the expense and update totalExpenses for the user
  req.user
    .createExpense({ expenseamount, description, category })
    .then((expense) => {
      // Update totalExpenses in the user table
      const totalExpense =
        Number(req.user.totalExpenses) + Number(expenseamount);
      return User.update(
        { totalExpenses: totalExpense },
        { where: { id: req.user.id } }
      )
        .then(() => {
          return res.status(201).json({ expense, success: true });
        })
        .catch((err) => {
          console.error("Error updating totalExpenses:", err);
          return res.status(500).json({ success: false, error: err });
        });
    })
    .catch((err) => {
      console.error("Error adding expense:", err);
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
      console.error("Error fetching expenses:", err);
      return res.status(402).json({ error: err, success: false });
    });
};

exports.deleteexpense = (req, res, next) => {
  const expenseid = parseInt(req.query.id);

  Expense.findOne({ where: { id: expenseid } })
    .then((expense) => {
      if (!expense) {
        return res
          .status(404)
          .json({ success: false, message: "Expense not found" });
      }

      // Subtract the expense amount from totalExpenses
      const updatedTotalExpense =
        Number(req.user.totalExpenses) - Number(expense.expenseamount);

      // Delete the expense
      return Expense.destroy({ where: { id: expenseid } })
        .then(() => {
          // Update totalExpenses in the user table
          return User.update(
            { totalExpenses: updatedTotalExpense },
            { where: { id: req.user.id } }
          )
            .then(() => {
              return res
                .status(204)
                .json({ success: true, message: "Deleted Successfully" });
            })
            .catch((err) => {
              console.error(
                "Error updating totalExpenses after deletion:",
                err
              );
              return res.status(500).json({ success: false, error: err });
            });
        })
        .catch((err) => {
          console.error("Error deleting expense:", err);
          return res
            .status(403)
            .json({ success: false, message: "Failed to delete" });
        });
    })
    .catch((err) => {
      console.error("Error finding expense:", err);
      return res.status(500).json({ success: false, error: err });
    });
};
