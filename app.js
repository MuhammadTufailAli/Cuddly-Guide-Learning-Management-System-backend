const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit"); //to limit ip request
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
let cors = require("cors");

const app = express();

// Set securty HTTP header
app.use(helmet());

//Global Middleware
//To limit req from same ip address
const limiter = rateLimit({
  max: 100, //so we allowed 100 req in
  windowMs: 60 * 60 * 1000, // one hours from same ip address
  message: "To many request from this IP, please try again in an hour",
});
//to connect to front end
app.use(cors());

app.use("/users", limiter); // /users ka mtlb is route sa jitna bhi route start hota ha un pa apply ho ga ya

//0) Importing routes
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/product");
var reviewRouter = require("./routes/review");
var conversationRouter = require("./routes/conversation");
var messageRouter = require("./routes/message");
var bookingRoute = require("./routes/bookingRoute");
var AdminNotificationRoute = require("./routes/AdminNotificationRoute");
var UserNotificationRoute = require("./routes/UserNotificationRoute");
var lectureRoute = require("./routes/lectureRoute");
//This is middleware by using this we get body of req data
app.use(express.json());

// it parses the data from cookie
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // ya req.body sa sara $ or dot . remove kar data ha or isi liya hum na isa body middleware k necha likha ha
//Data sanitization against XSS
app.use(xss()); // ya agr req ma html code aa gay ha to usa handle kara ga

//prevent paramter pollution
app.use(hpp());

//1) Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// To get header of request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//2) Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/review", reviewRouter);
app.use("/product", productRouter);
app.use("/conversation", conversationRouter);
app.use("/message", messageRouter);

app.use("/booking", bookingRoute);
app.use("/adminNotification", AdminNotificationRoute);
app.use("/userNotification", UserNotificationRoute);
app.use("/lecture", lectureRoute);
//unhandled route middleware
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!!!`,
  });
});

//3)Start Server
module.exports = app;
