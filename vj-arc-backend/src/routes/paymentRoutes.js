const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createOrderForPaidRegistration, verifyPaymentStatus, handleCashfreeWebhook } = require("../controllers/paymentController");

const router = express.Router();

router.post("/cashfree/create-order", createOrderForPaidRegistration);
router.post("/cashfree/admin/create-order", protect, createOrderForPaidRegistration);
router.post("/cashfree/verify", verifyPaymentStatus);
router.post("/cashfree/webhook", handleCashfreeWebhook);

module.exports = router;
