var express = require("express");
var router = express.Router();

const loginController = require("../controller/loginController");
const messageController = require("../controller/messageController");
const conversationController = require("../controller/conversationController");
router
  .route("/")
  .post(
    conversationController.updateConversation,
    messageController.addMessage
  );

router.route("/:ConversationId").get(messageController.getMessage);

module.exports = router;
