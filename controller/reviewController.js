const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  //Allow nested Routes
  if (!req.body.refOfProduct) req.body.refOfProduct = req.params.productid;
  if (!req.body.refOfUser) req.body.refOfUser = req.user.id; //Yaad raha protect route huma user send karta ha req.user ma waha sa hum user ki info hasil kar sakta ha
  next();
};

exports.getReviews = factory.getAll(Review);
exports.getsingleReview = factory.getOne(Review);
exports.postReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

exports.getproductReview = async (req, res, next) => {
  try {
    const productReview = await Review.find({ refOfProduct: req.params.id });
    console.log(productReview);
    res.status(200).json({
      status: 'success',
      result: productReview.length,
      data: productReview,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};
