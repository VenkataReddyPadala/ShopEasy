import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { getOne } from "./handlerFactory.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Review from "../models/reviewModel.js";

import mongoose from "mongoose";
import APIFeatures from "../utils/apiFeatures.js";
import { clearUserCart } from "./cartController.js";

// export const createOrder = catchAsync(async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { shippingInfo, orderItems, paymentInfo } = req.body;

//     let calculatedItemsPrice = 0;
//     const validatedOrderItems = []; // Our secure, backend-built array

//     for (const item of orderItems) {
//       const product = await Product.findById(item.product).session(session);

//       if (!product) throw new AppError("Product not found", 404);

//       // 1. Pushing ONLY verified data to our local array
//       validatedOrderItems.push({
//         name: product.name,
//         price: product.price, // Overwrites anything sent from frontend
//         quantity: item.quantity,
//         image: product.images[0].url, // Pulling actual image from DB
//         product: product._id,
//       });

//       calculatedItemsPrice += product.price * item.quantity;

//       // 2. Atomic Stock Update
//       const updatedProduct = await Product.findOneAndUpdate(
//         { _id: item.product, stock: { $gte: item.quantity } },
//         { $inc: { stock: -item.quantity } },
//         { session, returnDocument: "after" }
//       );

//       if (!updatedProduct)
//         throw new AppError(`${product.name} is out of stock!`, 400);
//     }

//     // 3. Final Calculations
//     const taxPrice = Math.round(calculatedItemsPrice * 0.18);
//     const shippingPrice = calculatedItemsPrice > 1000 ? 0 : 100;
//     const totalPrice = calculatedItemsPrice + taxPrice + shippingPrice;

//     // 4. Your clean orderData object
//     const orderData = {
//       shippingInfo,
//       orderItems: validatedOrderItems, // Use our validated array here
//       paymentInfo,
//       itemsPrice: calculatedItemsPrice,
//       taxPrice,
//       shippingPrice,
//       totalPrice,
//       user: req.user.id,
//       paidAt: Date.now(),
//     };

//     // 5. Create with Session
//     const order = await Order.create([orderData], { session });

//     await session.commitTransaction();

//     res.status(201).json({
//       status: "success",
//       order: order[0],
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     next(err);
//   } finally {
//     session.endSession();
//   }
// });

// Change this to a general function that takes data directly
export const executeOrderCreation = async (user, body, sessionPass = null) => {
  const session = sessionPass || (await mongoose.startSession());
  if (!sessionPass) session.startTransaction();

  try {
    const { shippingInfo, orderItems, paymentInfo } = body;

    let calculatedItemsPrice = 0;
    const validatedOrderItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new AppError("Product not found", 404);

      validatedOrderItems.push({
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0].url,
        product: product._id,
      });

      calculatedItemsPrice += product.price * item.quantity;

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, returnDocument: "after" }
      );

      if (!updatedProduct)
        throw new AppError(`${product.name} is out of stock!`, 400);
    }

    const taxPrice = Math.round(calculatedItemsPrice * 0.18);
    const shippingPrice = calculatedItemsPrice > 1000 ? 0 : 100;
    const totalPrice = calculatedItemsPrice + taxPrice + shippingPrice;

    const orderData = {
      shippingInfo,
      orderItems: validatedOrderItems,
      paymentInfo,
      itemsPrice: calculatedItemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      user: user.id,
      paidAt: Date.now(),
    };

    const order = await Order.create([orderData], { session });
    await clearUserCart(user.id, session);

    if (!sessionPass) await session.commitTransaction();

    return order[0]; // Return the created document directly
  } catch (err) {
    if (!sessionPass) await session.abortTransaction();
    throw err;
  } finally {
    if (!sessionPass) session.endSession();
  }
};

// Keep your original endpoint route working seamlessly by calling the utility function
export const createOrder = catchAsync(async (req, res, next) => {
  const order = await executeOrderCreation(req.user, req.body);

  res.status(201).json({
    status: "success",
    order,
  });
});

export const getOrder = getOne(Order, [
  { path: "user", select: "name email" },
  { path: "orderItems.product", select: "name price stock" },
]);

export const setMyOrdersFilter = (req, res, next) => {
  req.filterOverride = { user: req.user.id };
  next();
};

export const getAllOrders = catchAsync(async (req, res, next) => {
  // 1. Admin Security: Identify products belonging to this user
  const myProducts = await Product.find({ user: req.user.id }).select("_id");
  const myProductIds = myProducts.map((p) => p._id);

  // 2. Base Filter: Role-based isolation
  let baseFilter = {};
  if (req.user.role !== "super-admin") {
    baseFilter = { "orderItems.product": { $in: myProductIds } };
  }

  // Allow nested routing or specific product filtering (e.g., /products/:productId/orders)
  if (req.params.productId || req.query.productId) {
    baseFilter["orderItems.product"] =
      req.params.productId || req.query.productId;
  }

  // 3. STATS: Total Revenue (All documents matching the filter)
  const stats = await Order.aggregate([
    { $match: baseFilter },
    { $unwind: "$orderItems" },
    {
      $match:
        req.user.role !== "super-admin"
          ? { "orderItems.product": { $in: myProductIds } }
          : {},
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
        },
      },
    },
  ]);

  const totalAmount = stats.length > 0 ? stats[0].totalRevenue : 0;

  // 4. PRE-PAGINATION COUNT (Matches your getAll logic)
  const filteredFeatures = new APIFeatures(
    Order.find(baseFilter),
    req.query
  ).filter();

  const totalDocs = await filteredFeatures.query.clone().countDocuments();

  // 5. PAGINATED DATA
  const features = new APIFeatures(Order.find(baseFilter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const orders = await features.query;

  // 6. Pagination Calculations
  const currentPage = features.page || 1;
  const limit = features.limit || 10;
  const totalPages = Math.ceil(totalDocs / limit);

  // Page check (Matches your getAll logic)
  if (totalDocs > 0 && currentPage > totalPages) {
    return next(new AppError("This page does not exist", 404));
  }

  res.status(200).json({
    status: "success",
    totalAmount,
    results: orders.length,
    totalResults: totalDocs,
    currentPage,
    totalPages,
    data: orders,
  });
});

export const getAllOrderItems = catchAsync(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Admin Security - Fetch all product IDs belonging to this admin
  const myProducts = await Product.find({ user: req.user.id }).select("_id");
  const myProductIds = myProducts.map((p) => p._id);

  let matchStage = {};

  // Performance Optimization: Use $elemMatch for indexed array scanning
  if (req.user.role !== "super-admin") {
    matchStage = {
      orderItems: {
        $elemMatch: { product: { $in: myProductIds } },
      },
    };
  }

  // Count total items matching this admin's products
  const countResult = await Order.aggregate([
    { $match: matchStage },
    { $unwind: "$orderItems" },
    ...(req.user.role !== "super-admin"
      ? [
          {
            $match: {
              "orderItems.product": { $in: myProductIds },
            },
          },
        ]
      : []),
    {
      $count: "totalItems",
    },
  ]);

  const totalItems = countResult[0]?.totalItems || 0;

  // Fetch paginated, isolated items
  const items = await Order.aggregate([
    { $match: matchStage },

    { $unwind: "$orderItems" },

    // Post-unwind match ensures Admin A never sees Admin B's items from a shared order
    ...(req.user.role !== "super-admin"
      ? [
          {
            $match: {
              "orderItems.product": { $in: myProductIds },
            },
          },
        ]
      : []),

    {
      $project: {
        _id: "$orderItems._id",
        orderId: "$_id",
        name: "$orderItems.name",
        quantity: "$orderItems.quantity",
        price: "$orderItems.price",
        status: "$orderItems.status",
        image: "$orderItems.image",
        product: "$orderItems.product",
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        user: "$user",
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  res.status(200).json({
    status: "success",
    results: items.length,
    totalResults: totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    data: items,
  });
});

const restoreStock = async (items, session) => {
  const stockRestorations = items.map((item) => {
    return Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } },
      { session }
    );
  });
  await Promise.all(stockRestorations);
};

const recalculateOrderPrices = (order) => {
  // An item is active if its status is NOT 'Cancelled'
  const activeItems = order.orderItems.filter((i) => i.status !== "Cancelled");

  // 1. Calculate Items Price
  order.itemsPrice = activeItems.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

  // 2. Handle Shipping & Overall Order Status
  if (activeItems.length === 0) {
    order.shippingPrice = 0;
    order.orderStatus = "Cancelled"; // The whole order is now cancelled
  }

  // 3. Recalculate Tax and Total
  order.taxPrice = Math.round(order.itemsPrice * 0.18);
  order.totalPrice = order.itemsPrice + order.taxPrice + order.shippingPrice;
};

const syncOrderStatus = (order) => {
  const statuses = order.orderItems.map((item) => item.status);

  // 1. PRIORITY 1: If EVERY single item is Cancelled -> Order is Cancelled
  if (statuses.every((s) => s === "Cancelled")) {
    order.orderStatus = "Cancelled";
    order.deliveredAt = undefined; // Cleanup in case it was set by mistake
    return; // Exit here so it doesn't check the Delivered logic
  }

  // 2. PRIORITY 2: If everything left is Delivered (and we know from above not all are cancelled)
  // This means there is at least one Delivered item and zero Shipped/Processing items.
  else if (statuses.every((s) => ["Delivered", "Cancelled"].includes(s))) {
    order.orderStatus = "Delivered";
    if (!order.deliveredAt) order.deliveredAt = Date.now();
  }

  // 3. PRIORITY 3: Everything has left the warehouse (Shipped + Delivered + Cancelled)
  else if (
    statuses.every((s) => ["Shipped", "Delivered", "Cancelled"].includes(s))
  ) {
    order.orderStatus = "Shipped";
  }

  // 4. DEFAULT: If even ONE item is still "Processing", the whole order is "Processing"
  else {
    order.orderStatus = "Processing";
  }
};

export const cancelOrder = catchAsync(async (req, res, next) => {
  const { id: orderId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  const query = { _id: orderId };
  if (req.user.role !== "admin") {
    query.user = req.user.id;
  }
  try {
    const order = await Order.findOne(query).session(session);

    if (!order) return next(new AppError("Order not found", 404));

    // 1. Global status validation
    if (["Shipped", "Delivered", "Cancelled"].includes(order.orderStatus)) {
      return next(
        new AppError(
          `Cannot cancel an order that is already ${order.orderStatus}`,
          400
        )
      );
    }

    // 2. Identify items that haven't been cancelled yet to restore stock safely
    // Exclude items that are already 'Cancelled', 'Shipped', or 'Delivered'
    const itemsToRestoreStock = order.orderItems.filter(
      (item) => !["Cancelled", "Shipped", "Delivered"].includes(item.status)
    );

    if (itemsToRestoreStock.length > 0) {
      await restoreStock(itemsToRestoreStock, session);
    }

    // 3. Track full refund amount if order was already paid
    if (order.paymentInfo.status === "success") {
      order.refundAmount = order.totalPrice;
    }

    // 4. Update every item's status to Cancelled
    order.orderItems.forEach((item) => {
      item.status = "Cancelled";
    });

    order.orderStatus = "Cancelled";

    await order.save({ session, validateBeforeSave: false });
    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

export const cancelOrderItem = catchAsync(async (req, res, next) => {
  const { orderId, itemId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    }).session(session);
    if (!order) return next(new AppError("Order not found", 404));

    const item = order.orderItems.id(itemId);
    if (!item) return next(new AppError("Item not found", 404));

    // Business Logic: Check item status
    if (item.status === "Cancelled") {
      return next(new AppError("Item is already cancelled", 400));
    }

    if (["Shipped", "Delivered"].includes(item.status)) {
      return next(
        new AppError(
          `Cannot cancel item because it is already ${item.status}`,
          400
        )
      );
    }

    // Restore stock and update status
    await restoreStock([item], session);
    item.status = "Cancelled";

    // Recalculate based on new 'Cancelled' status
    if (order.paymentInfo.status !== "success") {
      recalculateOrderPrices(order);
    }
    syncOrderStatus(order);

    await order.save({ session });
    await session.commitTransaction();

    res.status(200).json({ status: "success", data: { order } });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

// export const updateItemStatus = catchAsync(async (req, res, next) => {
//   const { orderId, itemId } = req.params;
//   const { status } = req.body;

//   // 1. Fetch Order and the specific Item
//   const order = await Order.findById(orderId);
//   if (!order) return next(new AppError("Order not found", 404));

//   const item = order.orderItems.id(itemId);
//   if (!item) return next(new AppError("Item not found", 404));

//   // 2. GUARDRAIL: Final State Check
//   if (["Cancelled", "Delivered"].includes(item.status)) {
//     return next(
//       new AppError(`Cannot change status: Item is already ${item.status}`, 400)
//     );
//   }

//   // 3. OWNERSHIP CHECK: Fetch the product to verify the creator
//   const product = await Product.findById(item.product);
//   if (!product) return next(new AppError("Product no longer exists", 404));

//   const isProductOwner = product.user.toString() === req.user.id.toString();
//   const isSuperAdmin = req.user.role === "super-admin"; // Optional: for platform owners
//   const isOrderOwner = order.user.toString() === req.user.id.toString();

//   // 4. PERMISSION LOGIC

//   // A) CANCELLATION LOGIC
//   if (status === "Cancelled") {
//     // Permission: Either the Buyer (if not shipped) OR the Seller OR SuperAdmin
//     if (!isOrderOwner && !isProductOwner && !isSuperAdmin) {
//       return next(
//         new AppError("You do not have permission to cancel this item", 403)
//       );
//     }

//     // User specific restriction: cannot cancel if Seller already shipped it
//     if (item.status === "Shipped" && !isProductOwner && !isSuperAdmin) {
//       return next(
//         new AppError(
//           "You cannot cancel an item that has already been shipped",
//           400
//         )
//       );
//     }

//     await restoreStock([item]);
//   }

//   // B) SHIPPING/DELIVERY LOGIC
//   if (["Shipped", "Delivered"].includes(status)) {
//     // ONLY the Admin who OWNS the product can mark it as Shipped/Delivered
//     if (!isProductOwner && !isSuperAdmin) {
//       return next(
//         new AppError(
//           "You can only update shipping for products you created",
//           403
//         )
//       );
//     }
//   }

//   // 5. EXECUTION
//   item.status = status;
//   if (status === "Shipped") item.shippedAt = Date.now();
//   if (status === "Delivered") item.deliveredAt = Date.now();

//   // Re-calculate and Sync
//   if (status === "Cancelled") recalculateOrderPrices(order);
//   syncOrderStatus(order);

//   await order.save();

//   res.status(200).json({
//     status: "success",
//     data: { order },
//   });
// });

export const updateOrderItemStatus = catchAsync(async (req, res, next) => {
  const { orderId, itemId } = req.params;
  const { status } = req.body;

  const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return next(new AppError("Invalid or missing status value", 400));
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) return next(new AppError("Order not found", 404));

    const item = order.orderItems.id(itemId);
    if (!item) return next(new AppError("Item not found", 404));

    // 1. DATA FETCHING FOR AUTH
    const product = await Product.findById(item.product).session(session);

    const isProductOwner = product?.user.toString() === req.user.id.toString();
    const isOrderOwner = order.user.toString() === req.user.id.toString();
    const isSuperAdmin = req.user.role === "super-admin";

    // 2. THE "DYNAMIC" RESTRICTION
    // This is essentially what your restrictTo would do if it could see the DB
    if (status === "Cancelled") {
      // Only Buyer (if not shipped), Seller, or SuperAdmin
      const canCancel = isOrderOwner || isProductOwner || isSuperAdmin;
      if (!canCancel)
        return next(new AppError("Not authorized to cancel", 403));

      if (item.status === "Shipped" && !isProductOwner && !isSuperAdmin) {
        return next(new AppError("Buyers cannot cancel shipped items", 400));
      }

      await restoreStock([item], session);
    } else if (["Shipped", "Delivered"].includes(status)) {
      // Only Seller or SuperAdmin
      if (!isProductOwner && !isSuperAdmin) {
        return next(
          new AppError("Only the product seller can ship/deliver", 403)
        );
      }
    }

    // 3. APPLY UPDATES
    item.status = status;
    if (status === "Shipped") item.shippedAt = Date.now();
    if (status === "Delivered") item.deliveredAt = Date.now();

    if (status === "Cancelled") recalculateOrderPrices(order);
    syncOrderStatus(order);

    await order.save({ session });
    await session.commitTransaction();

    res.status(200).json({ status: "success", data: { order } });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

export const getDashboardStats = catchAsync(async (req, res, next) => {
  // 1. Fetch distinct entity quantities cleanly in parallel execution
  const [totalProducts, totalOrders, totalReviews] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Review.countDocuments(),
  ]);

  // 2. Compute live stock indicators via simple conditional matching groups
  const stockStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
        inStock: { $sum: { $cond: [{ $gt: ["$stock", 0] }, 1, 0] } },
      },
    },
  ]);

  // 3. Aggregate precise corporate revenue numbers using exact status filters
  const revenueStats = await Order.aggregate([
    {
      $match: { "paymentInfo.status": "success" },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  // Normalize fallback structures in case your collection pipelines return empty sets
  const inStockCount = stockStats[0]?.inStock || 0;
  const outOfStockCount = stockStats[0]?.outOfStock || 0;
  const computedRevenue = revenueStats[0]?.totalRevenue || 0;

  res.status(200).json({
    status: "success",
    data: {
      totalProducts,
      totalOrders,
      totalReviews,
      totalRevenue: computedRevenue,
      outOfStock: outOfStockCount,
      inStock: inStockCount,
    },
  });
});
