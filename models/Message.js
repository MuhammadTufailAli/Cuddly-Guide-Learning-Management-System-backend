const mongoose = require('mongoose');

//ab message ik conversation box ma jay ga
//Is liya huma conversation box ki id chaya
//hum sender ki id chaya ta k pata chl saka ya banda is conversation box ma ha k nahi
//Agr ha to sender ya reciever ha
//Is k ilava huma text chaya jo sender send kara ga
const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', MessageSchema); // it will create a collection with productSchema
module.exports = Message;
