class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.message = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    console.log(message + '||' + statusCode + '||' + status);

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
