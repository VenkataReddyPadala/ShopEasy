// import multer from "multer";

// import { CloudinaryStorage } from "multer-storage-cloudinary";

// import { v2 as cloudinary } from "cloudinary";

// // Note: Cloudinary configuration is picked up automatically from server.js

// // 1. Setup the Cloudinary storage engine

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "products",

//     allowed_formats: ["jpg", "png", "jpeg", "webp"],

//     public_id: (req, file) => {
//       // Create a clean filename: name-timestamp

//       const originalNameWithoutExt = file.originalname
//         .split(".")
//         .slice(0, -1)
//         .join(".");

//       const cleanName = originalNameWithoutExt.replace(/\s+/g, "-");

//       return `${cleanName}-${Date.now()}`;
//     },
//   },
// });

// // 2. Initialize multer with our storage configuration

// export const upload = multer({ storage: storage });

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const getCleanFilename = (file) => {
  const originalNameWithoutExt = file.originalname
    .split(".")
    .slice(0, -1)
    .join("."); //makes product img.jpg to product img
  return originalNameWithoutExt.replace(/\s+/g, "-"); //makes product img to product-img
};

// --- PRODUCTS CONFIGURATION ---
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Saved in products folder
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => `${getCleanFilename(file)}-${Date.now()}`,
  },
});

export const uploadProductImages = multer({ storage: productStorage });

// --- AVATARS CONFIGURATION ---
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars", // Saved in avatars folder
    allowed_formats: ["jpg", "png", "jpeg"],
    public_id: (req, file) => `avatar-${req.user._id}-${Date.now()}`, // Nicely pairs it to the User ID!
  },
});
export const uploadUserAvatar = multer({ storage: avatarStorage });
