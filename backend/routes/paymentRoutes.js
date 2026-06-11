import express from "express";
import { protect } from "../controllers/authController.js";
import {
  processPayment,
  sendAPIKey,
  verifyPayment,
} from "../controllers/paymentController.js";
const router = express.Router();
router.use(protect);
router.route("/getKey").get(sendAPIKey);
router.route("/process").post(processPayment);
router.route("/verify").post(verifyPayment);
export default router;
