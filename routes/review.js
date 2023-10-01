var express = require('express');
var router = express.Router({ mergeParams: true });

const loginController = require('../controller/loginController');
const reviewController = require('../controller/reviewController');

router
  .route('/')
  .post(
    loginController.protect,
    loginController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.postReview
  )
  .get(reviewController.getReviews);
router
  .route('/:id')
  .get(reviewController.getsingleReview)
  .patch(
    loginController.protect,
    loginController.restrictTo('user'),
    reviewController.updateReview
  );

router
  .route('/getProductReview/:id')
  .get(reviewController.getproductReview)

  .delete(
    loginController.protect,
    loginController.restrictTo('user', 'shopOwner'),
    reviewController.deleteReview
  );
module.exports = router;
