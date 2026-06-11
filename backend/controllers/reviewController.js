import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./handlerFactory.js";
import Review from "../models/reviewModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const setProductIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  req.body.user = req.user.id;
  next();
};
export const getMyReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    product: req.params.productId,
    user: req.user.id,
  }).populate({
    path: "user",
    select: "name avatar",
  });

  res.status(200).json({
    status: "success",
    data: review || null,
  });
});

export const canUpdateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  if (!review.user.equals(req.user.id)) {
    return next(
      new AppError("You do not have permission to perform this action", 403)
    );
  }
  next();
});

export const canDeleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }
  if (review.user.equals(req.user.id) || req.user.role === "admin") {
    return next();
  }
  return next(new AppError("You do not have permission to delete this.", 403));
});

export const getAllReviews = getAll(Review, {
  path: "user",
  select: "name avatar",
});
export const getReview = getOne(Review);
export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
