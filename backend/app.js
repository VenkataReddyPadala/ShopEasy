import express from "express";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import globalErrorHandler from "./controllers/errorController.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
// import path from "path";
// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4173",
    credentials: true,
  })
);
app.set("query parser", "extended");
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
// app.use(fileUpload()); removed it bez we are not directly using req.files for signup,updateMe imges we are just sending Base64url as json so to read json we dont need fileupload,if we are directly sending the file then we need this but since we switched to multer there is no need
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", fileUpload(), userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/payments", paymentRouter);

// if (process.env.NODE_ENV === "production") {
//   // 1. Serve static files from frontend build
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   // 2. Fallback route for client-side routing
//   app.get("/*splat", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

app.use(globalErrorHandler);
export default app;
