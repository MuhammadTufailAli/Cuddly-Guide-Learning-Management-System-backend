const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const notification = require('./../models/AdminNotification');
const factory = require('./handlerFactory');

exports.AddNotification = async (req, res, next) => {
  const token = req.token;
  const user = req.CreatedUser;
  const cookieOptions = req.cookie;
  try {
    if (user.role === 'user') {
      res.cookie('jwt', token, cookieOptions);
      res.status(201).json({
        status: 'success',
        token,
        data: {
          user,
        },
      });
    } else {
      const Notification = await notification.create({
        refOfUser: req.CreatedUser._id,
      });
      console.log(Notification);
      res.status(201).json({
        status: 'success',

        data: {
          user,
        },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Error in generating token',
    });
  }
};
exports.getNotification = async (req, res, next) => {
  try {
    const allNotifications = await notification.find();
    res.status(200).json({
      result: allNotifications.length,
      status: 'Success',
      data: {
        allNotifications,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Error in generating token',
    });
  }
};

exports.deleteNotification = factory.deleteOne(notification);
