var express = require("express");
var router = express.Router();

const loginController = require("../controller/loginController");
const conversationController = require("../controller/conversationController");

router.route("/").post(conversationController.addConversation);

router
  .route("/GetConversation")
  .post(conversationController.getUserConversation);

router
  .route("/find/:firstUserId/:secondUserId")
  .get(conversationController.getUserConversation2);
module.exports = router;
