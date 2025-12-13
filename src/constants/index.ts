export const BASE_URLS = {
  sandbox: "https://api.sandbox.konnect.network/api/v2",
  production: "https://api.konnect.network/api/v2",
};

export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_RETRY_ATTEMPTS = 3;

export const Environments = {
  SANDBOX: "sandbox",
  PRODUCTION: "production",
} as const;

export type Environment = (typeof Environments)[keyof typeof Environments];

export const PAYMENT_METHODS = {
  CARD: "CARD",
  KONNECT: "KONNECT",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const CURRENCIES = {
  TND: "TND",
  EUR: "EUR",
  USD: "USD",
} as const;

export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;
