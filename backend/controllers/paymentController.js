import crypto from "crypto";
import Order from "../models/orderModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Product from "../models/productModel.js";
import { executeOrderCreation } from "./orderController.js";
import { instance as razorpayInstance } from "../config/razorpay.js";
export const processPayment = catchAsync(async (req, res, next) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };

  const order = await razorpayInstance.orders.create(options);

  res.status(200).json({
    status: "success",
    order,
  });
});

export const sendAPIKey = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    key: process.env.RAZORPAY_API_KEY,
  });
});

export const verifyPayment = catchAsync(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingInfo,
    orderItems,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(
      new AppError("Invalid input data. Razorpay credentials missing.", 400)
    );
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return next(
      new AppError("Payment verification failed! Invalid signature.", 400)
    );
  }

  // 3. SECURE BACKEND RECALCULATION
  let itemsPrice = 0;

  // Fetch the real, untampered prices from your Database using the IDs sent by the frontend
  for (const item of orderItems) {
    const dbProduct = await Product.findById(item.product);
    if (!dbProduct) {
      return next(
        new AppError(`Product not found with ID: ${item.product}`, 404)
      );
    }
    itemsPrice += dbProduct.price * item.quantity;

    // Update the item price in the payload with the real DB price just to be safe
    item.price = dbProduct.price;
  }

  const taxPrice = itemsPrice * 0.18; // 18% Tax
  const shippingPrice = itemsPrice > 500 ? 0 : 50;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // 4. Double-check our calculated total against what Razorpay actually charged
  // Use 'razorpayInstance' instead of 'instance' to prevent naming conflicts
  const razorpayOrderDetails = await razorpayInstance.orders.fetch(
    razorpay_order_id
  );

  if (
    Math.round(razorpayOrderDetails.amount) !== Math.round(totalPrice * 100)
  ) {
    return next(
      new AppError(
        "Payment tampering detected! Value mismatch between system and gateway.",
        400
      )
    );
  }

  // 5. Construct Final Order Payload safely with backend-calculated prices
  const finalizedOrderPayload = {
    shippingInfo,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo: {
      id: razorpay_payment_id,
      status: "success",
    },
  };

  // 6. Complete creation
  const confirmedOrder = await executeOrderCreation(
    req.user,
    finalizedOrderPayload
  );

  res.status(200).json({
    status: "success",
    message: "Payment authenticated and order successfully processed.",
    order: confirmedOrder,
  });
});
