import crypto from "crypto";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      minlength: [3, "Name should contain atleast 3 letters"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [8, "Password must be longer than 8 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [
        function () {
          return this.isNew || this.isModified("password");
        },
        "Please confirm your password",
      ],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "Passwords are not the same",
      },
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Inside your userSchema definition
    addresses: [
      {
        name: {
          type: String,
          required: [true, "Please provide a name"],
          trim: true,
        },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        pincode: { type: String, required: true },
        phoneNo: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    // active: { type: Boolean, default: true, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});

// userSchema.pre("save", function () {
//   if (!this.isModified("addresses")) return;

//   const aliases = this.addresses.map((addr) =>
//     addr.alias?.toLowerCase().trim()
//   );
//   const isDuplicate = aliases.some(
//     (alias, index) => aliases.indexOf(alias) !== index
//   );

//   if (isDuplicate) {
//     throw new AppError("Address aliases must be unique per user.", 400);
//   }

//   const hasNewDefault = this.addresses.some((addr) => addr.isDefault === true);

//   if (hasNewDefault) {
//     const newDefaultIndex = this.addresses.findLastIndex(
//       (addr) => addr.isDefault === true
//     );

//     this.addresses.forEach((addr, idx) => {
//       if (idx !== newDefaultIndex) {
//         addr.isDefault = false;
//       }
//     });
//   } else if (this.addresses.length > 0) {
//     const currentDefault = this.addresses.find(
//       (addr) => addr.isDefault === true
//     );
//     if (!currentDefault) {
//       this.addresses[0].isDefault = true;
//     }
//   }
// });
userSchema.pre(/^find/, function () {
  this.select("-__v -passwordChangedAt");
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

userSchema.methods.verifyPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires =
    Date.now() + process.env.PASSWORD_RESET_EXPIRES_IN * 60 * 1000;
  return resetToken;
};

export default mongoose.model("User", userSchema);
