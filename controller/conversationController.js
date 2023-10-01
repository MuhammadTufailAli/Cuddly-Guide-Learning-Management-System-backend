const Conversation = require("../models/Conversation");

//new conv

exports.addConversation = async (req, res, next) => {
  const getConversation = await Conversation.findOne({
    members: { $all: [req.body.senderId, req.body.receiverId] },
  });

  if (getConversation) {
    res.status(200).json({
      status: "success",

      message: "Conversation already exists",
    });
  } else {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    try {
      const saveConversation = await newConversation.save();
      res.status(200).json(saveConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
};

//Get user conversation

exports.getUserConversation = async (req, res, next) => {
  try {
    console.log("I am inside get conversation");
    console.log(req.body);
    const getConversation = await Conversation.find({
      members: { $in: [req.body.id] },
    });

    console.log(getConversation);
    if (getConversation) {
      res.status(200).json({
        result: getConversation.length,
        data: getConversation,
        currentUser: req.body.id,
      });
    } else {
      res.status(200).json({
        result: getConversation.length,
        data: null,
        currentUser: req.body.id,
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getUserConversation2 = async (req, res, next) => {
  try {
    const getConversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });

    console.log("hi");
    console.log(getConversation);
    res.status(200).json({
      data: getConversation,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateConversation = async (req, res, next) => {
  try {
    const doc = await Conversation.findByIdAndUpdate(
      req.body.conversationId,
      { lastMessage: req.body.text },
      {
        new: true,
        runValidators: true,
      }
    );
    console.log(doc);
    next();
  } catch (err) {
    console.log(err);
  }
};
