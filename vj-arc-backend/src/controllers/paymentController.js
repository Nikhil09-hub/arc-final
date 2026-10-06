const crypto = require("crypto");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const RegistrationParticipant = require("../models/RegistrationParticipant");
const { calculateRegistrationAmount } = require("../services/registrationFeeService");
const { createCashfreeOrder, getCashfreeOrderStatus, verifyCashfreeWebhook } = require("../services/cashfreeService");

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

const getOrderReference = () => `vjarc_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

const getBaseUrl = () => process.env.BACKEND_URL || process.env.FRONTEND_URL || "http://localhost:5000";

const parseRegistrationPayload = (event, body = {}) => {
  const registrationType = event.registration?.format || "individual";

  if (registrationType === "individual") {
    const participant = {
      fullName: cleanText(body.fullName),
      rollNo: cleanText(body.rollNo),
      email: cleanText(body.email).toLowerCase(),
      phone: cleanText(body.phone),
      college: cleanText(body.college),
      department: cleanText(body.department),
      year: cleanText(body.year),
    };

    if (Object.values(participant).some((value) => !value)) {
      throw new Error("All participant fields are required.");
    }

    if (!validEmail(participant.email)) {
      throw new Error("Please provide a valid email address.");
    }

    return {
      registrationType,
      registrationData: {
        eventId: event._id,
        registrationType,
        ...participant,
        payment: {
          required: true,
          amount: Number(event.registration?.payment?.amount) || 0,
          currency: (event.registration?.payment?.currency || "INR").toUpperCase(),
          status: "pending",
          provider: "cashfree",
          orderId: "",
          paymentId: "",
          paidAt: null,
        },
      },
      participants: [{ rollNo: participant.rollNo }],
    };
  }

  const teamConfig = event.registration?.team || {};
  const minMembers = Number(teamConfig.minimumMembers) || 2;
  const maxMembers = Number(teamConfig.maximumMembers) || 4;
  const team = body.team && typeof body.team === "object" ? body.team : {};
  const leader = team.leader && typeof team.leader === "object" ? team.leader : {};
  const members = Array.isArray(team.members) ? team.members : [];
  const teamName = cleanText(team.teamName);

  if (!Number.isInteger(minMembers) || !Number.isInteger(maxMembers) || minMembers < 2 || maxMembers < minMembers) {
    throw new Error("Team registration is incorrectly configured.");
  }

  if (teamConfig.teamNameEnabled && teamConfig.teamNameRequired && !teamName) {
    throw new Error("Team name is required.");
  }

  const teamSize = members.length + 1;
  if (teamSize < minMembers || teamSize > maxMembers) {
    throw new Error(`Team size must be between ${minMembers} and ${maxMembers} members.`);
  }

  const cleanLeader = {
    name: cleanText(leader.name),
    rollNo: cleanText(leader.rollNo),
    email: cleanText(leader.email).toLowerCase(),
    phone: cleanText(leader.phone),
  };

  const cleanMembers = members.map((member) => ({
    name: cleanText(member?.name),
    rollNo: cleanText(member?.rollNo),
    email: cleanText(member?.email).toLowerCase(),
    phone: cleanText(member?.phone),
  }));

  const values = [...Object.values(cleanLeader), ...cleanMembers.flatMap((member) => Object.values(member))];
  if (values.some((value) => !value)) {
    throw new Error("Every team member must provide a name, roll number, email, and phone number.");
  }

  if (!validEmail(cleanLeader.email) || cleanMembers.some((member) => !validEmail(member.email))) {
    throw new Error("Please provide a valid email address for every team member.");
  }

  const participants = [{ rollNo: cleanLeader.rollNo }, ...cleanMembers.map(({ rollNo }) => ({ rollNo }))];

  return {
    registrationType,
    registrationData: {
      eventId: event._id,
      registrationType,
      fullName: cleanLeader.name,
      rollNo: cleanLeader.rollNo,
      email: cleanLeader.email,
      phone: cleanLeader.phone,
      team: {
        teamName,
        teamSize,
        leader: cleanLeader,
        members: cleanMembers,
      },
      payment: {
        required: true,
        amount: Number(event.registration?.payment?.amount) || 0,
        currency: (event.registration?.payment?.currency || "INR").toUpperCase(),
        status: "pending",
        provider: "cashfree",
        orderId: "",
        paymentId: "",
        paidAt: null,
      },
    },
    participants,
  };
};

const ensureNoDuplicateParticipants = async (eventId, participants) => {
  const normalizedRollNumbers = participants.map(({ rollNo }) => rollNo.toUpperCase());
  if (new Set(normalizedRollNumbers).size !== normalizedRollNumbers.length) {
    throw new Error("A roll number can only appear once in a team.");
  }

  const existingRegistrations = await Registration.find({ eventId }).select("rollNo team.members.rollNo payment.status");
  const existingRollNumbers = new Set();

  for (const existing of existingRegistrations) {
    if (existing.rollNo) existingRollNumbers.add(existing.rollNo.toUpperCase());
    for (const member of existing.team?.members || []) {
      if (member.rollNo) existingRollNumbers.add(member.rollNo.toUpperCase());
    }
  }

  if (normalizedRollNumbers.some((rollNo) => existingRollNumbers.has(rollNo))) {
    throw new Error("One or more roll numbers are already registered for this event.");
  }
};

const createOrderForPaidRegistration = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { eventId } = body;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: "A valid eventId is required." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    if (event.visibility === "admin" && (!req.admin || event.slug !== "vj-arc-payment-test-event")) {
      return res.status(403).json({ success: false, message: "This event is restricted to administrators." });
    }

    const regConfig = event.registration || {};
    const isEnabled = Boolean(regConfig.enabled);
    const regType = regConfig.type || (regConfig.link?.trim() ? "external" : isEnabled ? "internal" : "none");

    if (!isEnabled || regType !== "internal") {
      return res.status(400).json({ success: false, message: "This event does not accept website registrations." });
    }

    if (!regConfig.payment?.enabled) {
      return res.status(400).json({ success: false, message: "Payment is not configured for this event." });
    }

    const now = new Date();
    const startDate = regConfig.startDate ? new Date(regConfig.startDate) : null;
    const endDate = regConfig.endDate ? new Date(regConfig.endDate) : null;

    if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return res.status(403).json({ success: false, message: "Registration is closed." });
    }

    if (now < startDate) {
      return res.status(403).json({ success: false, message: "Registration has not opened yet." });
    }

    if (now > endDate) {
      return res.status(403).json({ success: false, message: "Registration is closed." });
    }

    const { registrationData, participants, registrationType } = parseRegistrationPayload(event, body);
    const expectedAmount = calculateRegistrationAmount(event, registrationData);
    const configuredAmount = Number(regConfig.payment?.amount) || 0;

    if (expectedAmount !== configuredAmount || expectedAmount <= 0) {
      return res.status(400).json({ success: false, message: "The event payment amount is invalid." });
    }

    await ensureNoDuplicateParticipants(event._id, participants);

    const registrationId = new mongoose.Types.ObjectId();
    const orderId = getOrderReference();
    const customer = registrationType === "team"
      ? { name: registrationData.fullName, email: registrationData.email, phone: registrationData.phone, customerId: registrationData.rollNo }
      : { name: registrationData.fullName, email: registrationData.email, phone: registrationData.phone, customerId: registrationData.rollNo };

    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      amount: expectedAmount,
      currency: "INR",
      customer,
      returnUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/events/${event.slug}?payment=success`,
      notifyUrl: `${getBaseUrl()}/api/payments/cashfree/webhook`,
    });

    const paymentEntry = {
      required: true,
      amount: expectedAmount,
      currency: "INR",
      status: "pending",
      provider: "cashfree",
      orderId,
      paymentId: "",
      paidAt: null,
    };

    const registrationRecord = {
      _id: registrationId,
      ...registrationData,
      payment: paymentEntry,
    };

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const [savedRegistration] = await Registration.create([registrationRecord], { session });
        await RegistrationParticipant.insertMany(
          participants.map(({ rollNo }) => ({
            eventId: event._id,
            rollNo: rollNo.toUpperCase(),
            registrationId: savedRegistration._id,
          })),
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      success: true,
      message: "Cashfree order created successfully.",
      data: {
        registrationId: registrationId.toString(),
        orderId,
        paymentSessionId: cashfreeOrder?.payment_session_id || cashfreeOrder?.paymentSessionId || null,
        amount: expectedAmount,
        currency: "INR",
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Error creating payment order:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create payment order.",
    });
  }
};

const verifyPaymentStatus = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { registrationId, orderId } = body;

    if (!registrationId && !orderId) {
      return res.status(400).json({ success: false, message: "Registration or order reference is required." });
    }

    const query = {};
    if (registrationId && mongoose.Types.ObjectId.isValid(registrationId)) {
      query._id = registrationId;
    }
    if (orderId) {
      query["payment.orderId"] = orderId;
    }

    const registration = await Registration.findOne(query);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration payment not found." });
    }

    const statusResponse = await getCashfreeOrderStatus(registration.payment?.orderId || orderId);
    const orderData = statusResponse?.order_details || statusResponse?.order || statusResponse || {};
    const orderStatus = (orderData.order_status || orderData.status || statusResponse?.status || "").toUpperCase();
    const orderAmount = Number(orderData.order_amount ?? orderData.amount ?? registration.payment?.amount ?? 0);
    const orderCurrency = (orderData.order_currency || orderData.currency || "INR").toUpperCase();

    if (orderStatus === "PAID") {
      if (Number(orderAmount) !== Number(registration.payment?.amount || 0) || orderCurrency !== "INR") {
        return res.status(400).json({ success: false, message: "Payment verification failed: amount or currency mismatch." });
      }

      registration.payment = {
        ...registration.payment,
        amount: Number(registration.payment?.amount || orderAmount),
        currency: registration.payment?.currency || orderCurrency,
        status: "paid",
        paymentId: orderData.cf_payment_id || registration.payment?.paymentId || "",
        paidAt: new Date(),
      };
      await registration.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        data: {
          registrationId: registration._id,
          paymentStatus: "paid",
          amount: registration.payment.amount,
          currency: registration.payment.currency,
        },
      });
    }

    if (orderStatus === "PENDING") {
      registration.payment = { ...registration.payment, status: "pending" };
      await registration.save();
      return res.status(202).json({ success: true, message: "Payment is still pending.", data: { paymentStatus: "pending" } });
    }

    registration.payment = { ...registration.payment, status: "failed" };
    await registration.save();
    return res.status(402).json({ success: false, message: "Payment failed or was cancelled." });
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    return res.status(400).json({ success: false, message: error.message || "Payment verification failed." });
  }
};

const handleCashfreeWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const signatureValid = verifyCashfreeWebhook(rawBody, req.headers);

    if (!signatureValid) {
      return res.status(401).json({ success: false, message: "Invalid webhook signature." });
    }

    const payload = req.body || {};
    const paymentData = payload?.data?.payment || payload?.payment || payload?.data || {};
    const orderId = payload?.data?.order?.order_id || paymentData?.order_id || payload?.order_id || payload?.data?.order_id;
    const paymentStatus = (paymentData?.payment_status || payload?.payment_status || paymentData?.status || payload?.status || "").toUpperCase();
    const paymentId = paymentData?.cf_payment_id || paymentData?.payment_id || "";
    const amount = Number(paymentData?.payment_amount ?? paymentData?.amount);
    const paymentCurrency = (
      paymentData?.payment_currency ||
      payload?.data?.order?.order_currency ||
      paymentData?.currency ||
      ""
    ).toUpperCase();

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing order reference in webhook payload." });
    }

    const registration = await Registration.findOne({ "payment.orderId": orderId });
    if (!registration) {
      return res.status(200).json({ success: true, message: "Webhook acknowledged; no matching registration found." });
    }

    if (registration.payment?.orderId !== orderId) {
      console.warn("Ignoring Cashfree webhook with an order ID mismatch.");
      return res.status(200).json({ success: true, message: "Webhook ignored." });
    }

    if (registration.payment?.status === "paid") {
      return res.status(200).json({ success: true, message: "Payment already processed." });
    }

    if (paymentStatus === "SUCCESS") {
      const expectedAmount = Number(registration.payment?.amount);
      const expectedCurrency = (registration.payment?.currency || "").toUpperCase();

      if (
        registration.payment?.status !== "pending" ||
        !Number.isFinite(expectedAmount) ||
        !Number.isFinite(amount) ||
        amount !== expectedAmount ||
        expectedCurrency !== "INR" ||
        paymentCurrency !== expectedCurrency
      ) {
        console.warn("Ignoring Cashfree SUCCESS webhook due to payment status, amount, or currency mismatch.");
        return res.status(200).json({ success: true, message: "Webhook ignored; payment remains unconfirmed." });
      }

      registration.payment = {
        ...registration.payment,
        amount: expectedAmount,
        currency: expectedCurrency,
        status: "paid",
        paymentId,
        paidAt: new Date(),
      };
      await registration.save();
      return res.status(200).json({ success: true, message: "Webhook payment processed successfully." });
    }

    if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED" || paymentStatus === "NOT_ATTEMPTED") {
      registration.payment = { ...registration.payment, status: "failed" };
      await registration.save();
      return res.status(200).json({ success: true, message: "Webhook payment failed." });
    }

    if (paymentStatus === "PENDING") {
      registration.payment = { ...registration.payment, status: "pending" };
      await registration.save();
    }

    return res.status(200).json({ success: true, message: "Webhook processed." });
  } catch (error) {
    console.error("Error processing Cashfree webhook:", error.message);
    return res.status(500).json({ success: false, message: "Webhook processing failed." });
  }
};

module.exports = {
  createOrderForPaidRegistration,
  verifyPaymentStatus,
  handleCashfreeWebhook,
};
