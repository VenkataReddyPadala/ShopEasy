//This method uses storage and stores all the imges in memory first then tries to upload into cloudinary if cloudinary fails after few imgs uploded then it deletes the uploaded imgs from cloudinary

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import AppError from "../utils/appError.js";

// 1. Store files temporarily in memory as buffers
const storage = multer.memoryStorage();
export const uploadProductImages = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
});

// Helper function to clean up filenames
const getCleanFilename = (file) => {
  const originalNameWithoutExt = file.originalname
    .split(".")
    .slice(0, -1)
    .join(".");
  return originalNameWithoutExt.replace(/\s+/g, "-");
};

// 2. Custom helper function to handle Cloudinary streaming from a memory buffer
const streamUpload = (file) => {
  return new Promise((resolve, reject) => {
    const cleanName = `${getCleanFilename(file)}-${Date.now()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        public_id: cleanName,
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    // Pass the raw memory buffer into the stream pipe
    stream.end(file.buffer);
  });
};

// 3. Custom Middleware that manages the parallel upload and absolute rollback
export const uploadAndStreamToCloudinary = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const uploadedAssets = [];

  try {
    // Fire off all uploads concurrently
    const uploadPromises = req.files.map(async (file) => {
      const result = await streamUpload(file);
      uploadedAssets.push(result.public_id); // Track immediately upon individual success

      // Mutate the file object so the controller can read it later
      file.filename = result.public_id;
      file.path = result.secure_url;
    });

    await Promise.all(uploadPromises);
    next(); // All images uploaded perfectly! Move to controller.
  } catch (uploadError) {
    // 💥 CRITICAL ROLLBACK: If even ONE upload fails, immediately purge the ones that succeeded
    if (uploadedAssets.length > 0) {
      const rollbackPromises = uploadedAssets.map((publicId) =>
        cloudinary.uploader
          .destroy(publicId)
          .catch((err) =>
            console.error(`Ghost cleanup failed for ${publicId}:`, err)
          )
      );
      await Promise.all(rollbackPromises);
    }

    return next(
      new AppError(
        "Image upload service failed midway. Ghost files cleaned up.",
        503
      )
    );
  }
};

// router.route("/").post(
//   protect,
//   restrictTo("admin"),
//   uploadProductImages.array("images", 5),     // 1. Grab files into memory
//   uploadAndStreamToCloudinary,                // 2. Stream to Cloudinary with safety rollback
//   setProductUserIds,
//   createProduct                               // 3. Save to MongoDB
// );
