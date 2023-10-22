const { promisify } = require("util");
const User = require("./../models/loginModel");
const Product = require("./../models/productModel");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const sendEmail = require("./../utils/email");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const factory = require("./handlerFactory");

//we will create multer storage and multer filter for photo upload

//multer storage ya bata raha ha k file kaha store ho gi or us ka name kya ho ga
// const multerStorage = multer.diskStorage({
//   //distination thori si difficult ha yaha pa distination k pass humari req,file, and callback cb ka access hota ha
//   destination: (req, file, cb) => {
//     //agar koi error na aya to call back send kar do
//     cb(null, 'public/images/users');
//   },
//   filename: (req, file, cb) => {
//     // ab file name different rakhna k liya hum user-us ki id-us waqt time.jpg rakha ga
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//hum disk ki jaga memory ma image store karna chata ha is liya uper diskStorage wala ko comment kar diya
const multerStorage = multer.memoryStorage();

//multer filter
//is sa hum pata kara ga k uploaded cheez image ha k nhi
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Not an image! please upload image", false);
  }
};

//to upload photo in dest folder
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo"); //photo is a field which is going to hold image

//agar photo to size sahi na ho to usa set karna k liya
exports.resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();

    //hum na image ko disk pa store nahi kiya balka memory ma store kiya ha is liya hum buffer sa usa access kar sakta ha

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 }) //hum na jab image ko resize kar diya to ab hum usa disk ma store kar dain ga
      .toFile(`public/images/users/${req.file.filename}`);

    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

// to generate token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//to send response to user with token mean sending cookie

const createSendToken = (user, statusCode, res) => {
  try {
    const token = signToken(user._id);

    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      // secure: true,
      httpOnly: true,
    };

    user.password = undefined;

    res.cookie("jwt", token, cookieOptions);

    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Error in generating token",
    });
  }
};

//filterObj method

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//Add user to DB
exports.addUser = async (req, res, next) => {
  console.log(req.body);
  try {
    const newUser = await User.create({
      name: req.body.name,

      email: req.body.email,
      password: req.body.password,

      role: req.body.role,
      photo: req.body.photo,
    });

    res.status(200).json({
      status: "success",

      message: "User Created Successfully",
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

//Get allusers

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    //1) check is email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "please provide email and password",
      });
    }
    //check if user exists && password exist

    const user = await User.findOne({ email: email }).select("+password");
    console.log(user);
    //correctPassword is ma method in login model to check password
    // if (!user || !(await user.correctPassword(password, user.password))) {
    //   return res.status(401).json({
    //     status: "fail",
    //     message: "Incorrect email or password or you deleted account",
    //   });
    // }

    //calling a function to create and send response to user
    // createSendToken(user, 200, res);
    console.log(password === user?.password && email === user?.email);
    if (password === user?.password && email === user?.email) {
      res.status(200).json({
        status: "success",
        message: "Login Successfull",
        data: user,
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "Invalid credientials",
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
exports.delete = factory.deleteOne(User);

//to protect routes from unauthorized users
exports.protect = async (req, res, next) => {
  try {
    let token;
    //1) Getting token and check if it exist
    console.log(req.cookies.jwt);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! please login to get access",
      });
    }
    //2)verification token
    try {
      // jwt.verify promise return karta ha is liya hum na promise use kiya
      //hum token to secret key k sath compare kara ga jo humara pass config.env ma pari ha
      var decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: "fail",
        message: err.name,
      });
    }

    //3) check if user still exist

    try {
      var freshUser = await User.findById(decoded.id);
    } catch (err) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does not exist",
      });
    }

    //4) check if user change password after the token was issued
    //is ma hum changepassword time ko token creation time sa compare kara ga
    //changePasswordAfter is a function in modal

    if (freshUser.changePasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "User changed password please login again",
      });
    }
    //Grant access to protected route
    // this fresh user assigning is very important becasue we will use it in next autherization step
    req.user = freshUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "User changed password please login again",
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array which we will get from route
    //is if ka mtlb ha k agr jo hum na roles define kiya ha routes ma agr vo user ka role ha to usa next pa la jao
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "Your role do not have permission to do this action",
      });
    }
    next();
  };
};

exports.forgetPassword = async (req, res, next) => {
  try {
    //1) Get user based on posted email

    var userByEmail = await User.findOne({ email: req.body.email });
    try {
      //2) Generate random token
      //createPasswordResetToken is method in model
      //userByEmail document sa hum na createPasswordResetToken() ko access kiya ha to userByEmail ki sari info is method k pass chli jay gi
      var resetToken = userByEmail.createPasswordResetToken();

      //validateBeforeSave: false is ka mtlb scehme ma jitni validation ha ignore kar do
      await userByEmail.save({ validateBeforeSave: false });
      //3) Send it to user's email
      var resetURL = `${req.protocol}://${req.get(
        "host"
      )}/users/resetPassword/${resetToken}`;

      var message = `Forget your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n .\n if you didn't forget your password, please ignore this `;

      // sendEmail ik function ha jo hum na import kiya ha

      await sendEmail({
        email: userByEmail.email,
        subject: "Your password reset token for 10 min",
        message,
      });
      res.status(200).json({
        status: "Succes",
        message: "Token send to email",
      });
    } catch (err) {
      userByEmail.passwordResetToken = undefined;
      userByEmail.passwordResetExpires = undefined;

      await userByEmail.save({ validateBeforeSave: false });
      return res.status(500).json({
        status: "fail",
        message: "There is an error in sending email",
      });
    }
  } catch (err) {
    return res.status(404).json({
      status: "fail",
      message: "User with that email not found",
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    //1) Get user based on the token humara pass jo encrypted token ha usa user ko k pass jo token ha us sa compare kara ga
    //Ab hum user k token ko bhi encrypt kar da ga using crypto
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token) //because in resetPassword Url ma hum token params ki tor pa send kar raha ha
      .digest("hex");

    //Ab hum user find kara ga based on token us k sath sath dekha ga k token expire to nahi ho gaya
    //Agr token greater than noe time hova to is ka mtlb token future ma expire ho ga
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    //2)  if token has not benn expired, and there is user, set the password Q k hum na token expire time 10 min rakha hova ha
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    //save act as update if document contain _id and act as insert if document does not contains _id
    try {
      await user.save();
    } catch (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }

    //3) update changePasswordAt property for the user
    //Is hum na model ma middle ware bana k implement kiya ha

    //4) Log the user in, send JWT
    //calling a function to create and send response to user
    createSendToken(user, 200, res);
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid token or expired",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const password = req.body.password;
    //1) Get the user from the collection
    //protected route give us user and we can access it using req.user

    //2) if the posted password is correct
    //we will get password from user using req.body.password

    const user = await User.findOne({ email: req.user.email }).select(
      "+password"
    );
    //password vo password jodb ma ha
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect password",
      });
    }
    //3) Update the password
    user.password = req.body.newpassword;
    user.confirmPassword = req.body.confirmPassword;
    try {
      //hum na update is liya use nahi kiya q k agr update use kara ga to modelma jo pre wala middleware ha vo nhi chla ga
      await user.save();
    } catch (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }

    //4) Log user in, send JWT
    //calling a function to create and send response to user
    createSendToken(user, 200, res);
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    //1) Create error if user tries to update password
    // if (req.body.password || req.body.confirmPassword) {
    //   return res.status(400).json({
    //     status: "fail",
    //     message:
    //       "This route is not for updating password please use /updatePassword route",
    //   });
    // }

    //2) Get the user from the collection
    //protected route give us user and we can access it using req.user

    //3) Yaha pa hum save() use nahi kar sakta us ki jaga hum findOneandUpdate use kara ga
    //We willfilter out unwanted fields

    //filterObj uper ik method banaya hova ha

    console.log(req.body);
    // const filteredBody = filterObj(
    //   req.body,
    //   "name",
    //   "email",
    //   "password",
    //   "role"
    // );
    //filteredBody sa ya ho ga k jo hum fields filter kara ga agr user chnage kara to sirf vo change ho gi or baki purani hi raha gi or koi error bhi nahi aya ga

    //if user update photo
    // if (req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.body.id, req.body);

    const updatedUserResult = await User.findById(req.body.id);

    console.log(updatedUserResult);

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUserResult,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: "success",
      data: "Deleted",
    });
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getAll(User);

//get single user
exports.singleuser = factory.getOne(User, { path: "reviews" });

exports.updateUser = factory.updateOne(User);
