const mongoose = require('mongoose');

// Ya model is liya ha k jab bhi 2 banda chat karta ha to un ka
//ik conversation box ban jata ha jis ma dono ki id aa jati ha
//AB ik banda 3 banda sa chat kar raha ha to us k 3 conversation box ho ga
const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    lastMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', ConversationSchema); // it will create a collection with productSchema
module.exports = Conversation;
