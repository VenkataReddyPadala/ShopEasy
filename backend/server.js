// import dotenv from "dotenv";
// dotenv.config({ path: "backend/config/config.env", quiet: true });
// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION: 💥 Shutting down...");
//   console.log(err.name, err.message);
//   process.exit(1);
// });
// import app from "./app.js";
// import { connectMongoDatabase } from "./config/db.js";
// import { v2 as cloudinary } from "cloudinary";
// // import Razorpay from "razorpay";
// connectMongoDatabase();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// // export const instance = new Razorpay({
// //   key_id: process.env.RAZORPAY_API_KEY,
// //   key_secret: process.env.RAZORPAY_API_SECRET,
// // });

// const port = process.env.PORT || 3000;

// const server = app.listen(port, () => {
//   console.log(`server running on port ${port}`);
// });

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION: 💥 Shutting down...");
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// server.js
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "backend/config/config.env" });
}
// dotenv.config({ path: "backend/config/config.env", quiet: true });

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION: 💥 Shutting down...");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

import app from "./app.js";
import { connectMongoDatabase } from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";

let server;

const startServer = async () => {
  try {
    // 1. Connect to Database FIRST 🚀
    await connectMongoDatabase();

    // 2. Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // 3. Start Listening ONLY after successful setup 🎧
    const port = process.env.PORT || 3000;
    server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("💥 FAILED TO START SERVER:", err.message);
    process.exit(1);
  }
};

// Fire up the startup sequence
startServer();

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION: 💥 Shutting down...");
  console.log(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
