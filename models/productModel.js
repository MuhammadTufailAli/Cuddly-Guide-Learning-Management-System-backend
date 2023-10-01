const mongoose = require('mongoose');

const productScehma = new mongoose.Schema(
  {
    location: {
      //In mongoDb we have GeoJson for location
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    title: {
      type: String,
      required: [true, 'Product should have title'],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Product should have a condition'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product should have a price'],
    },
    description: {
      type: String,
      default: 'Nothing',
    },
    imageCover: {
      type: String,
      required: [true, 'Product must have a cover image'],
    },
    images: {
      type: [String],
      default: 'No image right now',
    },
    category: {
      type: String,
      required: [true, 'Product must have category'],
      trim: true,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, //set ik function ha jo humesha tab chalta ha jab ratingsAverage ki value set ho jay hum is ratingsAverage ko round karna k liya use kar raha ha
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Product must have quantity'],
    },
    refOfUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Product must belong to a Shop Owner'],
    },

    // user: [{ type: mongoose.Schema.ObjectId, ref: 'User' }], //User is name of collection from where we are using user
    createdDate: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true }, //it is imp when we are doing referencing
    toObject: { virtuals: true },
  }
);

productScehma.index({ price: 1 });
productScehma.index({ location: '2dsphere' });

//Virtual populate
productScehma.virtual('reviews', {
  ref: 'Review', // Name of the collection
  foreignField: 'refOfProduct', //review ma productid ko kis field sa represent kiya ha
  localField: '_id', //or product ma product id ka kasa represent kiya ha
});

const product = mongoose.model('Product', productScehma); // it will create a collection with productSchema
module.exports = product;
