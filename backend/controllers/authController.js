import crypto from "crypto";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import { sendEmail } from "../utils/email.js";
import { v2 as cloudinary } from "cloudinary";

// export const signup = catchAsync(async (req, res, next) => {
//   const {
//     name,
//     email,
//     password,
//     passwordConfirm,
//     avatar
//   } = req.body;
//   const newUser = await User.create({
//     name,
//     email,
//     password,
//     passwordConfirm,
//     avatar: {
//       public_id:"temp",
//       url:"temp"
//     },
//   });

//   createSendToken(newUser, 201, res);
// });

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, avatar } = req.body;

  // 1. Check for unique email FIRST (Database check) bez newUser.validate() only checks for required and types of the field
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const validationErrors = { email: "Email already exists" };
    return next(
      new AppError(
        "The email you entered is already in use.",
        400,
        validationErrors
      )
    );
  }

  // 2. Create instance and Validate schema (Required fields/Passwords)
  const newUser = new User({
    name,
    email,
    password,
    passwordConfirm,
    avatar: {
      public_id: "temp",
      url: "/images/default-avatar.jpg",
    },
  });

  await newUser.validate();

  let uploadedToCloudinary = false;
  let finalAvatarData = null;

  if (req.body.avatar && req.body.avatar.startsWith("data:image")) {
    try {
      const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      finalAvatarData = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      uploadedToCloudinary = true;
    } catch (cloudErr) {
      return next(new AppError("Image upload failed. Please try again.", 500));
    }
  } else {
    finalAvatarData = {
      public_id: "temp",
      url: "/images/default-avatar.jpg",
    };
  }

  if (finalAvatarData) newUser.avatar = finalAvatarData;

  try {
    await newUser.save({ validateBeforeSave: false });

    createSendToken(newUser, 201, res);
  } catch (err) {
    if (uploadedToCloudinary) {
      await cloudinary.uploader.destroy(finalAvatarData.public_id);
    }
    return next(
      new AppError(
        "Registration failed due to a server error. Please try again.",
        500
      )
    );
  }
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
});

// export const logout = (req, res) => {
//   res.cookie("jwt", "loggedout", {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true,
//   });
//   res.status(200).json({
//     status: "success",
//     message: "Successfully logged out",
//   });
// };

export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(200).json({
    status: "success",
    message: "Successfully logged out",
  });
};

export const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belong to this token does no longer exist.", 401)
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again", 401)
    );
  }
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

// export const forgotPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(new AppError("There is no user with that email address.", 404));
//   }
//   let resetToken;
//   try {
//     resetToken = user.createPasswordResetToken();
//   } catch (error) {
//     return next(
//       new AppError("Could not save reset token, please try again", 500)
//     );
//   }
//   await user.save({ validateBeforeSave: false });
//   // const resetPasswordURL = `${req.protocol}://${req.get(
//   //   "host"
//   // )}/resetPassword/${resetToken}`;
//   const resetPasswordURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
//   const message = `Forgor your password? Use the following link to reset your password: ${resetPasswordURL}.\n\nThis link will expire in ${process.env.PASSWORD_RESET_EXPIRES_IN} minutes.\n\nIf you didn't request a password reset, please ignore this email!`;
//   try {
//  when used await it is taking so long to get the toast bez it usually takes long time to send email using nodemailer so if we remove await it sends toast immediatly and in 10-15 seconds we get the email , we can use resend or sum other 3rd party package but resend needs us to hava domain name otherwise it only send mails to the resend.com registered email
//     await sendEmail({
//       email: user.email,
//       subject: "Your password reset token (valid for 10 min)",
//       message,
//     });
//     res.status(200).json({
//       status: "success",
//       message: `Email sent to ${user.email} successfully`,
//     });
//   } catch (error) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });

//     return next(
//       new AppError("There is an error sending the email. Try again later!", 500)
//     );
//   }
// });

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Find user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // 2. Generate the random reset token
  let resetToken;
  try {
    resetToken = user.createPasswordResetToken();
  } catch (error) {
    return next(
      new AppError("Could not save reset token, please try again", 500)
    );
  }

  // Save token to database (skipping validators like passwordConfirm)
  await user.save({ validateBeforeSave: false });

  // 3. Create the absolute URL for your Vercel frontend
  const resetPasswordURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  // Plain text fallback message
  const message = `Forgot your password? Use the following link to reset your password: ${resetPasswordURL}.\n\nThis link will expire in 10 minutes.\n\nIf you didn't request a password reset, please ignore this email!`;

  // 4. FIRE AND FORGET (No 'await' here)
  // We trigger Nodemailer in the background so the user doesn't wait 15 seconds
  sendEmail({
    email: user.email,
    subject: "ShopEasy - Password Reset Request",
    message: message, // Plain text fallback
    resetLink: resetPasswordURL, // Your HTML button link
  }).catch(async (error) => {
    // CRITICAL: Since we don't await, errors are caught inside this catch block.
    // If Nodemailer fails in the background, we clean up the DB tokens.
    console.error("Background Nodemailer Error on Render:", error);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  });

  // 5. Instantly respond to the frontend
  res.status(200).json({
    status: "success",
    message: `Reset link has been sent to ${user.email} successfully.`,
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Reset password token is Invalid or has expired", 400)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.verifyPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, res);
});

function createSendToken(user, statusCode, res) {
  const token = user.getJwtToken(); //instance method on userModel which creates and sends jwt token
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  user.passwordChangedAt = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
}
