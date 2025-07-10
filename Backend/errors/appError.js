

class AppError extends Error {
  constructor(statusCode, message) {
    super(message); // Call the built-in Error constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag to identify custom errors (vs programming bugs)

  }
}

export default AppError;