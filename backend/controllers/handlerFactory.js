import mongoose from "mongoose";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
export const getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };
    if (req.query.user) filter.user = req.query.user;
    if (req.filterOverride) {
      filter = { ...filter, ...req.filterOverride };
    }
    const filteredFeatures = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .search();

    const totalDocs = await filteredFeatures.query.clone().countDocuments();

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    if (popOptions) {
      features.query = features.query.populate(popOptions);
    }

    const docs = await features.query;

    const currentPage = features.page || 1;
    const limit = features.limit || 10;
    const totalPages = Math.ceil(totalDocs / limit);

    if (totalDocs > 0 && currentPage > totalPages) {
      return next(new AppError("This page does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      results: docs.length,
      totalResults: totalDocs,
      currentPage,
      totalPages,
      data: docs,
    });
  });

export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    let totalReviews;
    if (Model.modelName === "Product") {
      // mongoose.model('Review') is the safest way to grab the model
      // without circular imports
      totalReviews = await mongoose.model("Review").countDocuments({
        product: req.params.id,
      });
    }

    res.status(200).json({
      status: "success",
      totalReviews,
      data: doc,
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newdoc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: newdoc,
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
