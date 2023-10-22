const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  refOfUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Leacture must belong to a Mentor"],
  },
  MentorName: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  lectureName: {
    type: String,

    trim: true,
  },
  lectureDescription: {
    type: String,

    trim: true,
  },
  lectureLink: {
    type: String,

    trim: true,
  },
  lecturePdfLocation: {
    type: String,

    trim: true,
  },

  pdfData: {
    type: String,

    trim: true,
  },
});

const lecture = mongoose.model("Lecture", lectureSchema); // it will create a collection with userSchema
module.exports = lecture;
