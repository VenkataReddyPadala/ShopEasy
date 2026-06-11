import express from "express";
import reviewRouter from "./reviewRoutes.js";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProduct,
  getProductCategories,
  setProductUserIds,
  updateProduct,
} from "../controllers/productController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import { uploadProductImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use("/:productId/reviews", reviewRouter);
router
  .route("/")
  .get(getAllProducts)
  .post(
    protect,
    restrictTo("admin"),
    uploadProductImages.array("images", 5),
    setProductUserIds,
    createProduct
  );
router.get("/categories", getProductCategories);
router
  .route("/:id")
  .get(getProduct)
  .patch(
    protect,
    restrictTo("admin"),
    uploadProductImages.array("images", 5),
    updateProduct
  )
  .delete(protect, restrictTo("admin"), deleteProduct);
export default router;
