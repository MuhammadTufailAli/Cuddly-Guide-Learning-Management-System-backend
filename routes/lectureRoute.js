var express = require("express");

var router = express.Router();

const lectureController = require("../controller/lectureController");

router
  .route("/addLecture")
  .post(lectureController.addLecture, lectureController.createLecture);

router.route("/downloadLeacture").post(lectureController.downloadLeacture);

router.route("/getMentorLectures").post(lectureController.getMentorLectures);
router
  .route("/getLecturesByCategory")
  .post(lectureController.getLecturesByCategory);

router.route("/deleteLecture/:id").delete(lectureController.deleteLecture);

module.exports = router;
