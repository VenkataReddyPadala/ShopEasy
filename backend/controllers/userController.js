import User from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { deleteOne, getAll, getOne, updateOne } from "./handlerFactory.js";
import { v2 as cloudinary } from "cloudinary";

export const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// export const updateMe = catchAsync(async (req, res, next) => {
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       new AppError(
//         "This route is not for password updates. Please use /api/v1/users/updateMyPassword",
//         400
//       )
//     );
//   }
//   const filteredBody = filteredObj(req.body, "name", "email", "avatar");

//   const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
//     runValidators: true,
//     returnDocument: "after",
//   });
//   res.status(200).json({
//     status: "success",
//     data: {
//       user: updatedUser,
//     },
//   });
// });

// export const updateMe = catchAsync(async (req, res, next) => {
//   if (req.body.password || req.body.passwordConfirm) {
//     return next(
//       new AppError(
//         "This route is not for password updates. Please use /updateMyPassword",
//         400
//       )
//     );
//   }

//   const filteredBody = filteredObj(req.body, "name", "email");

//   const user = await User.findById(req.user._id);

//   if (
//     req.body.avatar &&
//     req.body.avatar !== "" &&
//     req.body.avatar.startsWith("data:image")
//   ) {
//     try {
//       // Delete old image if it exists
//       console.log("inside try");
//       if (user.avatar && user.avatar.public_id !== "temp") {
//         await cloudinary.uploader.destroy(user.avatar.public_id);
//         console.log("done");
//       }

//       // Upload new image
//       const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
//         folder: "avatars",
//         width: 150,
//         crop: "scale",
//       });

//       user.avatar = {
//         public_id: myCloud.public_id,
//         url: myCloud.secure_url,
//       };
//     } catch (cloudErr) {
//       return next(new AppError("Image upload failed.", 500));
//     }
//   }

//   // 5. Update other fields
//   Object.keys(filteredBody).forEach((key) => {
//     user[key] = filteredBody[key];
//   });

//   // 6. Save (this will trigger validators)
//   await user.save({ validateBeforeSave: true });

//   res.status(200).json({
//     status: "success",
//     data: {
//       user,
//     },
//   });
// });

export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("Not for password updates", 400));
  }

  const filteredBody = filteredObj(req.body, "name", "email");
  const user = await User.findById(req.user._id);

  let uploadedToCloudinary = false;
  let newAvatarData = null;
  const oldPublicId = user.avatar?.public_id;

  // 1. Handle Image Logic
  if (req.body.avatar && req.body.avatar.startsWith("data:image")) {
    // A. NEW IMAGE UPLOADED
    try {
      const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

      newAvatarData = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
      uploadedToCloudinary = true;
    } catch (cloudErr) {
      return next(new AppError("Image upload failed. Please try again.", 500));
    }
  } else if (req.body.avatar === "") {
    // B. IMAGE REMOVED (User clicked 'remove')
    newAvatarData = {
      public_id: "temp",
      url: "/images/default-avatar.jpg",
    };
  }

  if (newAvatarData) user.avatar = newAvatarData;

  Object.keys(filteredBody).forEach((key) => {
    user[key] = filteredBody[key];
  });

  // 3. Save with Rollback Logic
  try {
    // user.passwordConfirm = undefined;
    await user.save({ validateBeforeSave: true });

    // 4. Cleanup: If save succeeded AND we uploaded a new image, delete the OLD one
    if (uploadedToCloudinary && oldPublicId && oldPublicId !== "temp") {
      await cloudinary.uploader
        .destroy(oldPublicId)
        .catch((err) => console.log("Old image cleanup failed"));
    }

    // 5. Cleanup: If user intentionally removed image, delete the OLD one
    if (req.body.avatar === "" && oldPublicId && oldPublicId !== "temp") {
      await cloudinary.uploader
        .destroy(oldPublicId)
        .catch((err) => console.log("Old image cleanup failed"));
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (err) {
    // ROLLBACK: If DB save fails, delete the NEWLY uploaded image from Cloudinary
    if (uploadedToCloudinary && newAvatarData) {
      await cloudinary.uploader.destroy(newAvatarData.public_id);
    }
    return next(err);
  }
});

export const addAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("No user found with that ID", 404));

  const isFirstAddress = user.addresses.length === 0;

  if (req.body.isDefault === true || isFirstAddress) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
    req.body.isDefault = true;
  } else {
    req.body.isDefault = false;
  }

  user.addresses.push(req.body);

  // user.passwordConfirm = undefined;
  await user.save({ validateBeforeSave: true });

  res.status(201).json({
    status: "success",
    data: { addresses: user.addresses },
  });
});
export const updateAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("No user found with that ID", 404));

  const address = user.addresses.id(req.params.addressId);
  if (!address) return next(new AppError("Address not found", 404));

  // 1. Only process default logic if the user explicitly sends { isDefault: true }
  // We ignore it if they send 'false' to prevent a "no default" state.

  if (req.body.isDefault === true) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  } else {
    // Ensure the user isn't accidentally overwriting the existing isDefault: true
    // by removing it from req.body if it's false or undefined.
    delete req.body.isDefault;
  }

  // 2. Update the fields
  Object.assign(address, req.body);

  // 3. Maintenance
  user.passwordConfirm = undefined;
  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
    data: {
      address,
    },
  });
});

export const deleteAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) return next(new AppError("Address not found", 404));

  const wasDefault = address.isDefault;
  user.addresses.pull(req.params.addressId);

  // If we deleted the default, make the first remaining address the default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save({ validateBeforeSave: true });
  res.status(204).json({ status: "success", data: null });
});

export const setDefaultAddress = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }
  user.addresses.forEach((addr) => {
    addr.isDefault = false;
  });
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  address.isDefault = true;

  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
    data: { addresses: user.addresses },
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getAllUsers = getAll(User);
export const getUser = getOne(User);
export const updateUser = updateOne(User);

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  const avatarToDelete = user.avatar;

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "User deleted Successfully",
  });

  if (avatarToDelete && avatarToDelete.public_id !== "temp") {
    cloudinary.uploader
      .destroy(avatarToDelete.public_id)
      .catch((cloudErr) =>
        console.error(
          `Post-success asset cleanup failed during user deletion for ${avatarToDelete.public_id}:`,
          cloudErr
        )
      );
  }
});
