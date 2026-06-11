import express from "express";
import {
  addItemToCart,
  getMyCart,
  removeItemFromCart,
} from "../controllers/cartController.js";
import { protect } from "../controllers/authController.js";
const router = express.Router();
router.use(protect);
router.get("/", getMyCart);
router.post("/", addItemToCart);
router.delete("/:productId", removeItemFromCart);
export default router;
