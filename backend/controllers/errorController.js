import AppError from "../utils/appError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// const handleDuplicateFieldsDB = (err) => {
//   let message;

//   if (err.keyPattern && err.keyPattern.product && err.keyPattern.user) {
//     message = "You have already reviewed this product!";
//   } else if (err.keyValue && err.keyValue.email) {
//     message = `The email ${err.keyValue.email} is already in use. Please use another one!`;
//   } else {
//     const value = Object.values(err.keyValue)[0];
//     message = `Duplicate field value: ${value}. Please use another value!`;
//   }
//   const error = {
//     email: "Email already exists",
//   };

//   return new AppError(message, 400, error);
// };

// const handleValidationErrorDB = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);
//   const message = `Invalid input data. ${errors.join(". ")}`;
//   return new AppError(message, 400);
// };

const handleDuplicateFieldsDB = (err) => {
  let message;
  let structuredErrors = {};

  // 1. Check for the Compound Index (Product Reviews)
  if (err.keyPattern && err.keyPattern.product && err.keyPattern.user) {
    message = "You have already reviewed this product!";
    // structuredErrors.review = message;
  }
  // 2. Handle Single Fields (Email, Username, etc.)
  else {
    const field = Object.keys(err.keyValue)[0];
    const value = Object.values(err.keyValue)[0];

    message = `The ${field} "${value}" is already in use. Please use another one!`;

    // Dynamically build the object: { email: "Email is already in use" }
    structuredErrors[field] = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } is already in use.`;
  }

  return new AppError(message, 400, structuredErrors);
};

const handleValidationErrorDB = (err) => {
  const structuredErrors = Object.values(err.errors).reduce((acc, el) => {
    acc[el.path] = el.message;
    return acc;
  }, {});

  const message = "Invalid input data.";
  return new AppError(message, 400, structuredErrors);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again", 401);

const handleMulterUploadLimit = () =>
  new AppError("Cannot upload more than 5 images.", 400);

const handleInvalidFormat = () =>
  new AppError(
    "Invalid file format. Please upload only JPG, JPEG, PNG, or WEBP images.",
    400
  );

const handleCloudinaryUploadFail = () =>
  new AppError(
    "Image upload service failed. Please try again later or check your network.",
    503
  ); // 503 Service Unavailable

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  } else {
    console.error("Error 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;

    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (err.code === "LIMIT_UNEXPECTED_FILE") error = handleMulterUploadLimit();
    if (err.message && err.message.includes("allowed_formats"))
      error = handleInvalidFormat();
    // If Cloudinary breaks, it often passes back an 'http_code' or a specific message
    if (err.http_code || (err.message && err.message.includes("cloudinary"))) {
      error = handleCloudinaryUploadFail();
    }
    sendErrorProd(error, res);
  }
};
