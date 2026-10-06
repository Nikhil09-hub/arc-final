const DEFAULT_PAYMENT = Object.freeze({
  enabled: false,
  amount: 0,
  currency: "INR",
  feeType: "per_participant",
});

const VALID_FEE_TYPES = ["per_participant", "per_team"];

const normalizeCurrency = (value) => {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "INR";
  return normalized === "INR" ? "INR" : "INR";
};

const normalizePayment = (payment = {}, registration = {}) => {
  const rawPayment = payment && typeof payment === "object" ? payment : {};
  const format = registration?.format === "team" ? "team" : "individual";
  const feeType = VALID_FEE_TYPES.includes(rawPayment.feeType)
    ? rawPayment.feeType
    : "per_participant";

  return {
    enabled: Boolean(rawPayment.enabled),
    amount: Number.isFinite(Number(rawPayment.amount)) && Number(rawPayment.amount) >= 0
      ? Number(rawPayment.amount)
      : 0,
    currency: normalizeCurrency(rawPayment.currency),
    feeType: format === "team" ? feeType : "per_participant",
  };
};

const getRegistrationPaymentConfig = (event = {}) => {
  const registration = event?.registration || {};
  const payment = registration.payment || {};
  return normalizePayment(payment, registration);
};

const validateRegistrationPaymentConfig = (registration = {}) => {
  const rawPayment = registration?.payment && typeof registration.payment === "object"
    ? registration.payment
    : {};

  const format = registration?.format === "team" ? "team" : "individual";
  const amountValue = rawPayment.amount !== undefined ? Number(rawPayment.amount) : 0;
  const feeType = rawPayment.feeType;
  const currency = rawPayment.currency;

  if (rawPayment.amount !== undefined && Number.isFinite(amountValue) && amountValue < 0) {
    throw new Error("Payment amount cannot be negative.");
  }

  if (currency !== undefined && typeof currency === "string" && currency.trim().toUpperCase() !== "INR") {
    throw new Error("Only INR is supported for registration payment configuration.");
  }

  if (feeType !== undefined && !VALID_FEE_TYPES.includes(feeType)) {
    throw new Error("Registration fee type must be per_participant or per_team.");
  }

  const payment = normalizePayment(rawPayment, registration);

  if (!payment.enabled) {
    return { ...DEFAULT_PAYMENT, currency: "INR", feeType: format === "team" ? "per_participant" : "per_participant" };
  }

  if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
    throw new Error("Paid registration amount must be greater than zero.");
  }

  if (currency !== undefined && typeof currency === "string" && currency.trim().toUpperCase() !== "INR") {
    throw new Error("Only INR is supported for registration payment configuration.");
  }

  if (format === "individual" && payment.feeType !== "per_participant") {
    throw new Error("Individual registration fees must be charged per participant.");
  }

  if (format === "team" && !VALID_FEE_TYPES.includes(payment.feeType)) {
    throw new Error("Team registration fee type must be per_participant or per_team.");
  }

  return {
    enabled: true,
    amount: payment.amount,
    currency: "INR",
    feeType: payment.feeType,
  };
};

const resolveTeamSize = (registrationData = {}) => {
  const explicitSize = Number(registrationData?.teamSize);
  if (Number.isInteger(explicitSize) && explicitSize > 0) {
    return explicitSize;
  }

  if (registrationData?.team && typeof registrationData.team === "object") {
    const teamSize = Number(registrationData.team.teamSize);
    if (Number.isInteger(teamSize) && teamSize > 0) {
      return teamSize;
    }
    const members = Array.isArray(registrationData.team.members) ? registrationData.team.members : [];
    return Math.max(1, members.length + 1);
  }

  return 1;
};

const calculateRegistrationAmount = (event, registrationData = {}) => {
  const registration = event?.registration || {};
  const payment = getRegistrationPaymentConfig(event);

  if (!payment.enabled || !Number.isFinite(payment.amount) || payment.amount <= 0) {
    return 0;
  }

  const format = registration.format || registrationData?.registrationType || "individual";

  if (format === "team") {
    if (payment.feeType === "per_team") {
      return payment.amount;
    }

    return payment.amount * resolveTeamSize(registrationData);
  }

  return payment.amount;
};

module.exports = {
  DEFAULT_PAYMENT,
  VALID_FEE_TYPES,
  normalizePayment,
  getRegistrationPaymentConfig,
  validateRegistrationPaymentConfig,
  calculateRegistrationAmount,
  resolveTeamSize,
};
