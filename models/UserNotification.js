const mongoose = require('mongoose');

const UserNotificationSchema = new mongoose.Schema(
  {
    refOfUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Warning  must have user Id'],
    },
    refOfProduct: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
    warning: {
      type: String,
      required: [true, 'There should be a warning message'],
    },
    warningFrom: {
      type: String,
      required: [true, 'Warning  must come from admin'],
    },
  },
  { timestamps: true }
);

const UserNotification = mongoose.model(
  'UserNotification',
  UserNotificationSchema
); // it will create a collection with productSchema
module.exports = UserNotification;
