var express = require('express');
var router = express.Router();

const loginController = require('../controller/loginController');
const AdminNotificationController = require('../controller/AdminNotificationController');

router.get(
  '/getNotification',
  loginController.protect,
  AdminNotificationController.getNotification
);

router.delete(
  '/deleteNotification/:id',
  loginController.protect,
  loginController.restrictTo('admin'),
  AdminNotificationController.deleteNotification
);

module.exports = router;
