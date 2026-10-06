const crypto = require("crypto");

const getCashfreeBaseUrl = () => {
  if (process.env.CASHFREE_ENVIRONMENT !== "SANDBOX") {
    throw new Error("CASHFREE_ENVIRONMENT must be SANDBOX.");
  }
  return "https://sandbox.cashfree.com/pg";
};

const getCashfreeCredentials = () => ({
  clientId: process.env.CASHFREE_CLIENT_ID,
  clientSecret: process.env.CASHFREE_CLIENT_SECRET,
});

const getCashfreeWebhookSecret = () => process.env.CASHFREE_CLIENT_SECRET || "";

const createCashfreeOrder = async ({
  orderId,
  amount,
  currency = "INR",
  customer,
  returnUrl,
  notifyUrl,
}) => {
  const baseUrl = getCashfreeBaseUrl();
  const { clientId, clientSecret } = getCashfreeCredentials();

  if (!clientId || !clientSecret) {
    throw new Error("Cashfree sandbox credentials are not configured.");
  }

  const response = await fetch(`${baseUrl}/orders`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      "x-api-version": "2025-01-01",
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: currency,
      customer_details: {
        customer_id: customer?.customerId || "vj-arc-customer",
        customer_name: customer?.name || "VJ ARC Participant",
        customer_email: customer?.email || "participant@vjarc.in",
        customer_phone: customer?.phone || "9999999999",
      },
      order_meta: {
        return_url: returnUrl || "http://localhost:5173",
        notify_url: notifyUrl || "http://localhost:5000/api/payments/cashfree/webhook",
      },
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result?.message || result?.error_description || "Cashfree order creation failed.";
    throw new Error(message);
  }

  return result;
};

const getCashfreeOrderStatus = async (orderId) => {
  const baseUrl = getCashfreeBaseUrl();
  const { clientId, clientSecret } = getCashfreeCredentials();

  if (!clientId || !clientSecret) {
    throw new Error("Cashfree sandbox credentials are not configured.");
  }

  const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      "x-api-version": "2025-01-01",
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const message = result?.message || result?.error_description || "Cashfree order status check failed.";
    throw new Error(message);
  }

  return result;
};

const verifyCashfreeWebhook = (rawBody, headers = {}, secret = getCashfreeWebhookSecret()) => {
  if (process.env.CASHFREE_ENVIRONMENT !== "SANDBOX" || !secret) {
    return false;
  }

  const timestamp =
    headers["x-webhook-timestamp"] ||
    headers["x-cashfree-timestamp"] ||
    headers["x-cf-webhook-timestamp"] ||
    "";

  const signatureHeader =
    headers["x-webhook-signature"] ||
    headers["x-cashfree-signature"] ||
    headers["x-cf-webhook-signature"] ||
    "";

  if (!timestamp || !signatureHeader) {
    return false;
  }

  const payload = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(String(rawBody || ""));
  if (payload.length === 0) {
    return false;
  }

  const signedPayload = Buffer.concat([Buffer.from(String(timestamp)), payload]);
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  try {
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signatureHeader);
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch {
    return false;
  }
};

module.exports = {
  getCashfreeBaseUrl,
  createCashfreeOrder,
  getCashfreeOrderStatus,
  verifyCashfreeWebhook,
};
