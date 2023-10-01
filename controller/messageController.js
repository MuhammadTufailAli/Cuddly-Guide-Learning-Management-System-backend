const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

//add message with conversation id
exports.addMessage = async (req, res, next) => {
  const newMessage = new Message(req.body);
  try {
    const saveMessage = await newMessage.save();

    res.status(200).json(saveMessage);
  } catch (err) {
    res.status(500).json(err);
  }
};

//get all message of conversation
exports.getMessage = async (req, res, next) => {
  try {
    const conversationMessages = await Message.find({
      conversationId: req.params.ConversationId,
    });
    res.status(200).json(conversationMessages);
  } catch (err) {
    res.status(500).json(err);
  }
};
