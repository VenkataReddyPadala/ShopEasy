import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  canDeleteReview,
  canUpdateReview,
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  getMyReview,
  updateReview,
} from "../controllers/reviewController.js";

import { setProductIds } from "../controllers/reviewController.js";
const router = express.Router({ mergeParams: true });
router.get("/", getAllReviews);
router.use(protect);
router.get("/my-review", getMyReview);
router.route("/").post(restrictTo("user"), setProductIds, createReview);
router
  .route("/:id")
  .get(getReview)
  .patch(canUpdateReview, updateReview)
  .delete(canDeleteReview, deleteReview);
export default router;
