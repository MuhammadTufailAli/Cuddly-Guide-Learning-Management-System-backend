const lecture = require("../models/lectureModel");
const factory = require("./handlerFactory");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// exports.addLecture = factory.createOne(lecture);

exports.deleteLecture = factory.deleteOne(lecture);

// Set up Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Store files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

exports.addLecture = upload.single("pdfFile");

exports.createLecture = async (req, res, next) => {
  const {
    lectureName,
    lectureLink,
    lectureDescription,
    refOfUser,
    category,
    MentorName,
  } = req.body;

  try {
    const newLecture = new lecture({
      lectureName,
      lectureLink,
      lectureDescription,
      refOfUser,
      category,
      MentorName,
      lecturePdfLocation: req.file.path, // The path where the file is stored
    });
    console.log(newLecture);
    const doc = await newLecture.save();

    console.log(doc);
    res.status(201).json({
      status: "success",

      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.getMentorLectures = async (req, res, next) => {
  try {
    const mentorLectures = await lecture.find({
      refOfUser: req.body.id,
    });

    for (const lecture of mentorLectures) {
      const pdfFileName = lecture.lecturePdfLocation;
      const filePath = path.join(__dirname, "..", pdfFileName);

      // Read the PDF file data and store it in the lecture object
      const pdfData = fs.readFileSync(filePath);
      lecture.pdfData = pdfData;
      console.log("PDF Data Size:", pdfData.length);
    }

    res.status(200).json({
      status: "success",

      message: "leacture get successfully",
      data: mentorLectures,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getLecturesByCategory = async (req, res, next) => {
  try {
    const SelectedCategoryLectures = await lecture.find({
      category: { $in: req.body.category },
    });

    res.status(200).json({
      status: "success",

      message: "leacture get successfully",
      data: SelectedCategoryLectures,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.downloadLeacture = async (req, res, next) => {
  const fileName = req.body.pdfFileName;
  const filePath = path.join(__dirname, "..", fileName);

  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", "application/pdf");

  // Send the file as a stream
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};
