var express = require('express');
var router = express.Router();

const loginController = require('../controller/loginController');
const UserNotificationController = require('../controller/UserNotificationController');

router.post(
  '/postNotification',
  loginController.protect,
  loginController.restrictTo('admin'),
  UserNotificationController.postNotification
);

module.exports = router;
