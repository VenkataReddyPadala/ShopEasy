import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
      maxlength: [7, "A product price cannot exceed 7 digits"],
    },
    ratings: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "A product must have a category"],
    },
    stock: {
      type: Number,
      required: [true, "A product must have a stock"],
      // maxlength: [5, "A product stock cannot exceed 5"],
      default: 1,
      min: [1, "Stock value cannot be less than 1"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    timestamps: true,
  }
);
productSchema.index({ createdAt: -1 });
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// productSchema.pre(/^find/, function () {
//   this.select("-__v");
// });

export default mongoose.model("Product", productSchema);
