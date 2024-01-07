const express = require("express");

const router = express.Router();
const contactController = require("../controllers/contact");

router.get("/contactus", contactController.getSendFile);
router.post("/contactus", contactController.postSendFile);

router.get("/success", contactController.getSuccess);
module.exports = router;
