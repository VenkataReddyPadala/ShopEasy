import mongoose from "mongoose";
import Product from "./productModel.js";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 5"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Here we used static method instead of instance method bez instance methods are only for that particular document like updating password or verifying etc.here calculating avg need all the documents and also here we are using aggregate to calculate avg which also need Model (Model.aggregate[])
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        numReviews: { $sum: 1 },
        avgRatings: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numOfReviews: stats[0].numReviews,
      ratings: stats[0].avgRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      numOfReviews: 0,
      ratings: 4.5,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatings(this.product);
});
//in queries start with /^find/ "this" belongs to the  query so we cannot just do this.constructor here
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (!doc) return;
  await doc.constructor.calcAverageRatings(doc.product);
});

export default mongoose.model("Review", reviewSchema);
