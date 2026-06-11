import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: [true, "Shipping address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
      },
      phoneNo: {
        type: String,
        required: [true, "Phone number is required for delivery"],
      },
    },
    orderItems: [
      {
        name: {
          type: String,
          required: [true, "Item name is required"],
        },
        price: {
          type: Number,
          required: [true, "Item price is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Item quantity is required"],
        },
        image: {
          type: String,
          required: [true, "Item image is required"],
        },
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "Item must be linked to a product ID"],
        },
        status: {
          type: String,
          enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
          default: "Processing",
        },
        shippedAt: Date,
        deliveredAt: Date,
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    paymentInfo: {
      id: {
        type: String,
        required: [true, "Payment ID is required"],
      },
      status: {
        type: String,
        enum: {
          values: ["success", "failed", "pending"],
          message: "Status must be success, failed, or pending",
        },
        required: [true, "Payment status is required"],
      },
      //   paidAt: {
      //     type: Date,
      //     required: [true, "Payment timestamp (paidAt) is required"],
      //   },
    },
    paidAt: {
      type: Date,
      required: [true, "Payment timestamp (paidAt) is required"],
    },
    itemsPrice: {
      type: Number,
      required: [true, "Item price total is required"],
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: [true, "Tax amount is required"],
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: [true, "Shipping cost is required"],
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      default: 0,
    },
    orderStatus: {
      type: String,
      required: [true, "Order status is required"],
      enum: {
        values: ["Processing", "Shipped", "Delivered", "Cancelled"],
        message: "Invalid order status",
      },
      default: "Processing",
    },
    deliveredAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, orderStatus: 1 });
orderSchema.index({ "orderItems.product": 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
