var express = require('express');
var router = express.Router();

const loginController = require('../controller/loginController');
const bookingController = require('../controller/bookingController');

router.get(
  '/checkout-session/:productID',
  loginController.protect,
  bookingController.getCheckoutSession
);

router.post('/Postbooking', bookingController.postBooking);

// router.post('/payment', bookingController.postPayment);

module.exports = router;
