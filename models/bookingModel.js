const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // we will use referincing here to get product
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Booking must belong to a Product'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a Customer'],
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price. '],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    //Agar user credit card ki bajaya direct payment karna chaya
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'Product',
    select: 'title',
  });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
