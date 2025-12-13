export type Environment = 'sandbox' | 'production';
export type PaymentToken = 'TND' | 'EUR' | 'USD';
export type PaymentType = 'immediate' | 'partial';
export type PaymentMethod = 'wallet' | 'bank_card' | 'e-DINAR';
export type Theme = 'light' | 'dark';
export type PaymentStatus = 'completed' | 'pending';
export type TransactionStatus = 'success' | 'failed' | 'pending';

/**
 * Default configuration values for payment initialization
 */
export interface PaymentDefaults {
  /** Konnect wallet ID of the payment receiver */
  receiverWalletId?: string;
  /** Currency of payment (TND, EUR, USD) */
  token?: PaymentToken;
  /** Payment type: immediate (full payment) or partial (allows partial payments) */
  type?: PaymentType;
  /** Default payment description */
  description?: string;
  /** Allowed payment methods */
  acceptedPaymentMethods?: PaymentMethod[];
  /** Payment link expiration time in minutes */
  lifespan?: number;
  /** Whether payer must fill checkout form before payment */
  checkoutForm?: boolean;
  /** If true, adds Konnect fees to payer's amount */
  addPaymentFeesToAmount?: boolean;
  /** URL for payment notification (GET request) */
  webhook?: string;
  /** @deprecated Use webhook instead */
  silentWebhook?: boolean;
  /** @deprecated Redirect URL for successful payment */
  successUrl?: string;
  /** @deprecated Redirect URL for failed payment */
  failUrl?: string;
  /** Gateway theme: light or dark */
  theme?: Theme;
}

/**
 * SDK configuration options
 */
export interface KonnectConfig {
  /** Your Konnect API key (required) */
  apiKey: string;
  /** Environment to use: sandbox or production (default: sandbox) */
  environment?: Environment;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 3) */
  retryAttempts?: number;
  /** Default values for payment initialization */
  defaults?: PaymentDefaults;
}

/**
 * Payment initialization request parameters
 */
export interface InitPaymentRequest {
  /** Konnect wallet ID of the payment receiver (required if not set in defaults) */
  receiverWalletId?: string;
  /** Payment amount in millimes for TND / centimes for EUR and USD (required) */
  amount: number;
  /** Currency of payment: TND, EUR, or USD */
  token?: PaymentToken;
  /** Payment type: immediate (full payment) or partial (allows partial payments) */
  type?: PaymentType;
  /** Payment description visible to payer on gateway page */
  description?: string;
  /** Allowed payment methods: wallet, bank_card, e-DINAR */
  acceptedPaymentMethods?: PaymentMethod[];
  /** Payment link expiration time in minutes */
  lifespan?: number;
  /** Whether payer must fill checkout form before payment */
  checkoutForm?: boolean;
  /** If true, adds Konnect fees to payer's amount */
  addPaymentFeesToAmount?: boolean;
  /** Payer's first name */
  firstName?: string;
  /** Payer's last name */
  lastName?: string;
  /** Payer's phone number */
  phoneNumber?: string;
  /** Payer's email address */
  email?: string;
  /** Custom order identifier */
  orderId?: string;
  /** URL for payment notification (GET request) */
  webhook?: string;
  /** @deprecated If true, calls webhook without redirecting payer */
  silentWebhook?: boolean;
  /** @deprecated Redirect URL for successful payment */
  successUrl?: string;
  /** @deprecated Redirect URL for failed payment */
  failUrl?: string;
  /** Gateway theme: light or dark */
  theme?: Theme;
}

/**
 * Response from payment initialization
 */
export interface InitPaymentResponse {
  /** Payment gateway URL where the client can complete the payment */
  payUrl: string;
  /** Unique reference ID for the payment */
  paymentRef: string;
}

/**
 * Detailed payment information
 */
export interface PaymentDetails {
  payment: {
    /** Unique payment identifier */
    id: string;
    /** Payment status: completed or pending */
    status: PaymentStatus;
    /** Remaining amount due */
    amountDue: number;
    /** Amount already paid */
    reachedAmount: number;
    /** Original payment amount */
    amount: number;
    /** Payment currency */
    token: PaymentToken;
    /** Converted amount in base currency */
    convertedAmount: number;
    /** Exchange rate used for conversion */
    exchangeRate: number;
    /** Payment expiration date */
    expirationDate: string;
    /** Short payment identifier */
    shortId: string;
    /** Payment gateway link */
    link: string;
    /** Webhook URL */
    webhook?: string;
    /** Success redirect URL */
    successUrl?: string;
    /** Failure redirect URL */
    failUrl?: string;
    /** Custom order identifier */
    orderId?: string;
    /** Payment type */
    type: PaymentType;
    /** Payment description */
    details?: string;
    /** Accepted payment methods */
    acceptedPaymentMethods: PaymentMethod[];
    /** Receiver wallet information */
    receiverWallet: Record<string, unknown>;
    /** Payment transactions */
    transactions: Array<{
      /** Transaction status */
      status: TransactionStatus;
      [key: string]: unknown;
    }>;
  };
}

/**
 * Error information returned by the SDK
 */
export interface KonnectError {
  /** Human-readable error message */
  message: string;
  /** HTTP status code */
  statusCode?: number;
  /** Error code identifier */
  code?: string;
  /** Additional error details */
  details?: unknown;
}

/**
 * Successful API response
 */
export interface SuccessResponse<T> {
  /** Response data */
  data: T;
  /** No error */
  error: null;
}

/**
 * Error API response
 */
export interface ErrorResponse {
  /** No data */
  data: null;
  /** Error information */
  error: KonnectError;
}

/**
 * API response type with data or error
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;