var express = require("express");

var router = express.Router();
const loginController = require("../controller/loginController");
const productController = require("../controller/productController");
const reviewController = require("../controller/reviewController");
const bookingController = require("../controller/bookingController");
const AdminNotificationController = require("../controller/AdminNotificationController");

/* GET users listing. */
router.route("/signup").post(loginController.addUser);
router.route("/signin").post(loginController.login);
router.route("/forgetPassword").post(loginController.forgetPassword);
router.route("/resetPassword/:token").patch(loginController.resetPassword);

//Protect all routes after this middleware
router
  .route("/allUsers")
  .get(
    bookingController.createBookingCheckout,
    loginController.protect,
    loginController.restrictTo("admin"),
    loginController.getUser
  );
router.route("/singleUser/:id").get(loginController.singleuser);

router
  .route("/deleteUser/:id")
  .delete(
    loginController.protect,
    loginController.restrictTo("admin"),
    loginController.delete
  );

router
  .route("/updatePassword")
  .patch(loginController.protect, loginController.updatePassword);

router.route("/updateMe").patch(
  // loginController.protect,
  // loginController.uploadUserPhoto, //phla hum image ko memory ma store karva dain ga or sath phly isa filter bhi kara ga ya image ha k nhi
  // loginController.resizeUserPhoto, //agar image hovi to hum buffer k zarya usa hasil kar la ga q k vo memory ma ha or jab usa resize kar da ga to phr hum usa disk pa store kar da ga
  loginController.updateMe
);

router
  .route("/updateUser/:id")
  .patch(
    loginController.protect,
    loginController.restrictTo("admin"),
    loginController.updateUser
  );

router
  .route("/deleteMe")
  .delete(loginController.protect, loginController.deleteMe);

router
  .route("/me")
  .get(
    loginController.protect,
    loginController.getMe,
    loginController.singleuser
  );

module.exports = router;

//get and delete ma body ma kuch nahi bajhta

//post and patch ma body ma data bajhta ha
