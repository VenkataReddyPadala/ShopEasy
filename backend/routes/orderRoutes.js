import express from "express";
import { protect, restrictTo } from "../controllers/authController.js";
import {
  cancelOrder,
  cancelOrderItem,
  createOrder,
  getAllOrderItems,
  getAllOrders,
  getDashboardStats,
  getOrder,
  setMyOrdersFilter,
  updateOrderItemStatus,
} from "../controllers/orderController.js";
import { getAll } from "../controllers/handlerFactory.js";
import Order from "../models/orderModel.js";
const router = express.Router();
router.use(protect);
// router.get("/me", getmyOrders);
router.get("/me", setMyOrdersFilter, getAll(Order));
router.route("/").post(createOrder);
router.patch("/:orderId/items/:itemId/cancel", cancelOrderItem);
router.use(restrictTo("admin"));
router.get("/order-items", getAllOrderItems);
router.route("/dashboard-stats").get(getDashboardStats);
router.route("/").get(getAllOrders);
router.patch("/:orderId/items/:itemId/status", updateOrderItemStatus);
router.route("/:id").get(getOrder).patch(cancelOrder);

// router.route("/:id").get(getOrder);

export default router;
