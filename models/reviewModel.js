const mongoose = require('mongoose');
const Product = require('./productModel');
const reviewScehma = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please enter a review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    //we will use parent referencing as review is child of both parent and product
    refOfProduct: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a Product'],
    },
    refOfUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a User'],
    },
  },
  {
    toJSON: { virtuals: true }, //it is imp when we are doing referencing
    toObject: { virtuals: true },
  }
);

//To allow one user to give one review on same product
reviewScehma.index({ refOfProduct: 1, refOfUser: 1 }, { unique: true });

reviewScehma.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'refOfProduct',
  //   select: 'title',
  // })
  this.populate({
    path: 'refOfUser',
    select: 'firstname lastname photo',
  });

  next();
});

reviewScehma.statics.calcAverageRatings = async function (refOfProductId) {
  // refOfProductId hum na vo product get kiya jisa abhi review mila ha
  const stats = await this.aggregate([
    // hum na yaha aggregate method use kiya ha
    {
      $match: { refOfProduct: refOfProductId }, //tamam review ma sa us product k review get kiya
    },
    {
      $group: {
        _id: 'refOfProduct',
        nRating: { $sum: 1 }, //pechla number of reviwe ma 1 add kar diya
        avgRating: { $avg: '$rating' }, //pechla review k sath is review k rating k average la li
      },
    },
  ]);
  //is k bad hum na product ma us ki rating average an no of rating ko update kar diya
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(refOfProductId, {
      ratingQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(refOfProductId, {
      ratingQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//is na rating ki average count karna wala function ko call kiya ha or post hum na is liya use kiya k review phly db ma add ho jay phr hum us sa product ko update kara
reviewScehma.post('save', function () {
  //this point to current review
  // review.calcAverageRatings(this.refOfProduct); //ya model k name k sath use ho sakta ha magar abhi model initilize hi nahi hova to error aa jay ga ta is liya hum necha wala step sa ya kam kara ga
  this.constructor.calcAverageRatings(this.refOfProduct);
});

//findByIdAndUpdate
//findByIdAndDelete will not work here so we will make a middleware
//findOneAnd sa hum dono update and delete ko handle kar la ga
reviewScehma.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // is sa hum current document hasil kara ga ta k bad ma hum usa update ya delete kar saka
  next();
});

reviewScehma.post(/^findOneAnd/, async function () {
  //await this.findOne(); dies NOT work here is liya hum na uper wala ko direct pre sa post ma convert nahi kiya
  await this.r.constructor.calcAverageRatings(this.r.refOfProduct);
});

const review = mongoose.model('Review', reviewScehma); // it will create a collection with productSchema
module.exports = review;
