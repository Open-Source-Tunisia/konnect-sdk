/**
 * Konnect Payment Gateway SDK
 * A production-ready TypeScript SDK for integrating with Konnect's payment API
 *
 * @example
 * ```typescript
 * const konnect = new KonnectSDK({
 *   apiKey: 'your-api-key',
 *   environment: 'sandbox',
 *   defaults: {
 *     receiverWalletId: 'your-wallet-id',
 *     webhook: 'https://yourdomain.com/webhook',
 *     theme: 'dark'
 *   }
 * });
 *
 * const { data, error } = await konnect.initPayment({
 *   amount: 10000,
 *   orderId: 'order-123'
 * });
 * ```
 */

import { BASE_URLS } from "./constants";
import {
	KonnectSDKError,
	AuthenticationError,
	PaymentNotFoundError,
	ValidationError,
} from "./errors";
import {
	validateConfig,
	validateInitPaymentRequest,
	validatePaymentId,
	makeRequest,
	wrapResponse,
} from "./utils";
import type {
	ApiResponse,
	Environment,
	InitPaymentRequest,
	InitPaymentResponse,
	KonnectConfig,
	PaymentDefaults,
	PaymentDetails,
} from "./types";

// Re-export error classes for public API
export {
	KonnectSDKError,
	AuthenticationError,
	PaymentNotFoundError,
	ValidationError,
};

// ============================================================================
// Main SDK Class
// ============================================================================

/**
 * Konnect Payment Gateway SDK
 *
 * Provides methods to integrate with Konnect's payment API for Tunisia
 *
 * @example
 * ```typescript
 * // Initialize SDK with defaults
 * const konnect = new KonnectSDK({
 *   apiKey: 'your-api-key',
 *   environment: 'sandbox',
 *   defaults: {
 *     receiverWalletId: 'your-wallet-id',
 *     webhook: 'https://yourdomain.com/webhook',
 *     theme: 'dark',
 *     lifespan: 30
 *   }
 * });
 *
 * // Create payment (uses defaults)
 * const { data, error } = await konnect.initPayment({
 *   amount: 10000,
 *   orderId: 'order-123'
 * });
 *
 * // Override defaults
 * const { data: customPayment } = await konnect.initPayment({
 *   amount: 5000,
 *   receiverWalletId: 'different-wallet-id', // Override
 *   theme: 'light' // Override
 * });
 * ```
 */
export class KonnectSDK {
	private readonly apiKey: string;
	private readonly baseUrl: string;
	private readonly timeout: number;
	private readonly retryAttempts: number;
	private readonly defaults: PaymentDefaults;

	/**
	 * Creates a new Konnect SDK instance
	 *
	 * @param config - SDK configuration options
	 * @throws {ValidationError} If API key is missing or invalid
	 *
	 * @example
	 * ```typescript
	 * const konnect = new KonnectSDK({
	 *   apiKey: process.env.KONNECT_API_KEY,
	 *   environment: 'production',
	 *   timeout: 30000,
	 *   retryAttempts: 3,
	 *   defaults: {
	 *     receiverWalletId: 'wallet-123',
	 *     webhook: 'https://api.example.com/webhook',
	 *     theme: 'dark',
	 *     lifespan: 30,
	 *     token: 'TND'
	 *   }
	 * });
	 * ```
	 */
	constructor(config: KonnectConfig) {
		validateConfig(config);

		this.apiKey = config.apiKey;
		this.baseUrl = BASE_URLS[config.environment || "sandbox"];
		this.timeout = config.timeout || 30000;
		this.retryAttempts = config.retryAttempts || 3;
		this.defaults = config.defaults || {};
	}

	/**
	 * Makes an HTTP request with retry logic and exponential backoff
	 *
	 * @param endpoint - API endpoint path
	 * @param options - Fetch options
	 * @returns Promise resolving to the response data
	 * @throws {KonnectSDKError} If request fails after all retries
	 * @private
	 */
	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;

		const headers: HeadersInit = {
			"Content-Type": "application/json",
			"x-api-key": this.apiKey,
			...options.headers,
		};

		return makeRequest<T>(
			url,
			{
				...options,
				headers,
			},
			{
				timeout: this.timeout,
				retryAttempts: this.retryAttempts,
			},
		);
	}

	/**
	 * Merges request parameters with default configuration
	 *
	 * @param request - Request parameters to merge
	 * @returns Merged request with defaults applied
	 * @private
	 */
	private mergeWithDefaults(request: InitPaymentRequest): InitPaymentRequest {
		return {
			// Apply defaults first
			receiverWalletId: this.defaults.receiverWalletId,
			token: this.defaults.token,
			type: this.defaults.type,
			description: this.defaults.description,
			acceptedPaymentMethods: this.defaults.acceptedPaymentMethods,
			lifespan: this.defaults.lifespan,
			checkoutForm: this.defaults.checkoutForm,
			addPaymentFeesToAmount: this.defaults.addPaymentFeesToAmount,
			webhook: this.defaults.webhook,
			silentWebhook: this.defaults.silentWebhook,
			successUrl: this.defaults.successUrl,
			failUrl: this.defaults.failUrl,
			theme: this.defaults.theme,
			// Override with request parameters
			...request,
		};
	}

	/**
	 * Validates payment initialization request
	 *
	 * @param request - Request to validate
	 * @throws {ValidationError} If validation fails
	 * @private
	 */
	private validateInitPaymentRequest(request: InitPaymentRequest): void {
		validateInitPaymentRequest(request);
	}

	// ============================================================================
	// Public API Methods - Better Auth Style
	// ============================================================================

	/**
	 * Initialize a new payment
	 *
	 * Creates a payment and returns a payment URL where the customer can complete the transaction.
	 * Request parameters are merged with default values configured in the constructor.
	 *
	 * @param request - Payment initialization parameters
	 * @returns Promise resolving to {data, error} where data contains payUrl and paymentRef
	 *
	 * @example
	 * ```typescript
	 * // Using defaults from constructor
	 * const { data, error } = await konnect.initPayment({
	 *   amount: 10000, // 10 TND in millimes
	 *   orderId: 'order-123',
	 *   email: 'customer@example.com'
	 * });
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Override defaults for specific payment
	 * const { data, error } = await konnect.initPayment({
	 *   amount: 5000,
	 *   receiverWalletId: 'different-wallet-id', // Override default
	 *   theme: 'light', // Override default
	 *   lifespan: 60, // Override default
	 *   orderId: 'special-order-456'
	 * });
	 * ```
	 */
	async initPayment(
		request: InitPaymentRequest,
	): Promise<ApiResponse<InitPaymentResponse>> {
		return wrapResponse(async () => {
			const mergedRequest = this.mergeWithDefaults(request);
			this.validateInitPaymentRequest(mergedRequest);

			return this.request<InitPaymentResponse>("/payments/init-payment", {
				method: "POST",
				body: JSON.stringify(mergedRequest),
			});
		});
	}

	/**
	 * Get payment details by payment ID
	 *
	 * Retrieves comprehensive information about a payment including its status,
	 * transactions, and related wallet information.
	 *
	 * @param paymentId - Unique payment identifier (from paymentRef)
	 * @returns Promise resolving to {data, error} where data contains payment details
	 *
	 * @example
	 * ```typescript
	 * const { data, error } = await konnect.getPaymentDetails('60889219a388f75c94a943ec');
	 *
	 * if (error) {
	 *   if (error.code === 'PAYMENT_NOT_FOUND') {
	 *     console.log('Payment does not exist');
	 *   } else {
	 *     console.error('Failed to get payment:', error.message);
	 *   }
	 *   return;
	 * }
	 *
	 * console.log('Payment Status:', data.payment.status);
	 * console.log('Amount:', data.payment.amount / 1000, 'TND');
	 * console.log('Order ID:', data.payment.orderId);
	 *
	 * if (data.payment.status === 'completed') {
	 *   console.log('Payment successful!');
	 * }
	 * ```
	 */
	async getPaymentDetails(
		paymentId: string,
	): Promise<ApiResponse<PaymentDetails>> {
		return wrapResponse(async () => {
			validatePaymentId(paymentId);
			return this.request<PaymentDetails>(`/payments/${paymentId}`);
		});
	}

	/**
	 * Check if a payment is completed successfully
	 *
	 * Convenience method to quickly check payment completion status without
	 * fetching full payment details.
	 *
	 * @param paymentId - Unique payment identifier
	 * @returns Promise resolving to {data, error} where data is a boolean
	 *
	 * @example
	 * ```typescript
	 * const { data: isCompleted, error } = await konnect.isPaymentCompleted('payment-id');
	 *
	 * if (error) {
	 *   console.error('Error checking payment:', error.message);
	 *   return;
	 * }
	 *
	 * if (isCompleted) {
	 *   console.log('✅ Payment is completed!');
	 *   await processOrder();
	 * } else {
	 *   console.log('⏳ Payment is still pending');
	 * }
	 * ```
	 */
	async isPaymentCompleted(paymentId: string): Promise<ApiResponse<boolean>> {
		return wrapResponse(async () => {
			const result = await this.request<PaymentDetails>(
				`/payments/${paymentId}`,
			);
			return result.payment.status === "completed";
		});
	}

	/**
	 * Check if a payment has expired
	 *
	 * Checks if the payment has passed its expiration date. Expired payments
	 * can no longer be completed by customers.
	 *
	 * @param paymentId - Unique payment identifier
	 * @returns Promise resolving to {data, error} where data is a boolean
	 *
	 * @example
	 * ```typescript
	 * const { data: isExpired, error } = await konnect.isPaymentExpired('payment-id');
	 *
	 * if (!error && isExpired) {
	 *   console.log('Payment has expired, creating a new one');
	 *   const newPayment = await konnect.initPayment({
	 *     amount: originalAmount,
	 *     orderId: `${originalOrderId}-retry`
	 *   });
	 * }
	 * ```
	 */
	async isPaymentExpired(paymentId: string): Promise<ApiResponse<boolean>> {
		return wrapResponse(async () => {
			const result = await this.request<PaymentDetails>(
				`/payments/${paymentId}`,
			);
			const expirationDate = new Date(result.payment.expirationDate);
			return expirationDate < new Date();
		});
	}

	/**
	 * Get the current SDK environment
	 *
	 * Returns which environment the SDK is currently configured to use.
	 *
	 * @returns Current environment ('sandbox' or 'production')
	 *
	 * @example
	 * ```typescript
	 * const env = konnect.getEnvironment();
	 * console.log(`Using ${env} environment`);
	 *
	 * if (env === 'production') {
	 *   console.log('⚠️ Running in production mode');
	 * }
	 * ```
	 */
	getEnvironment(): Environment {
		return this.baseUrl.includes("sandbox") ? "sandbox" : "production";
	}

	/**
	 * Get the current default configuration
	 *
	 * Returns a copy of the default values configured in the constructor.
	 *
	 * @returns Copy of default configuration
	 *
	 * @example
	 * ```typescript
	 * const defaults = konnect.getDefaults();
	 * console.log('Default wallet:', defaults.receiverWalletId);
	 * console.log('Default webhook:', defaults.webhook);
	 * console.log('Default theme:', defaults.theme);
	 * ```
	 */
	getDefaults(): Readonly<PaymentDefaults> {
		return { ...this.defaults };
	}

	// ============================================================================
	// Legacy Methods (Throwing Errors) - For Backward Compatibility
	// ============================================================================

	/**
	 * Initialize a new payment (throws on error)
	 *
	 * @deprecated Use initPayment() with {data, error} pattern instead
	 * @param request - Payment initialization parameters
	 * @returns Promise resolving to payment response
	 * @throws {ValidationError} If validation fails
	 * @throws {AuthenticationError} If API key is invalid
	 * @throws {KonnectSDKError} For other errors
	 */
	async initPaymentOrThrow(
		request: InitPaymentRequest,
	): Promise<InitPaymentResponse> {
		const mergedRequest = this.mergeWithDefaults(request);
		this.validateInitPaymentRequest(mergedRequest);
		return this.request<InitPaymentResponse>("/payments/init-payment", {
			method: "POST",
			body: JSON.stringify(mergedRequest),
		});
	}

	/**
	 * Get payment details (throws on error)
	 *
	 * @deprecated Use getPaymentDetails() with {data, error} pattern instead
	 * @param paymentId - Unique payment identifier
	 * @returns Promise resolving to payment details
	 * @throws {PaymentNotFoundError} If payment not found
	 * @throws {ValidationError} If paymentId is invalid
	 * @throws {KonnectSDKError} For other errors
	 */
	async getPaymentDetailsOrThrow(paymentId: string): Promise<PaymentDetails> {
		if (!paymentId || paymentId.trim() === "") {
			throw new ValidationError("paymentId is required");
		}
		return this.request<PaymentDetails>(`/payments/${paymentId}`);
	}
}

/**
 * Creates a new Konnect SDK instance
 *
 * Factory function for creating SDK instances. Equivalent to using `new KonnectSDK()`.
 *
 * @param config - SDK configuration options
 * @returns New KonnectSDK instance
 *
 * @example
 * ```typescript
 * const konnect = createKonnectSDK({
 *   apiKey: 'your-api-key',
 *   environment: 'sandbox',
 *   defaults: {
 *     receiverWalletId: 'wallet-123',
 *     webhook: 'https://api.example.com/webhook',
 *     theme: 'dark'
 *   }
 * });
 * ```
 */
export function createKonnectSDK(config: KonnectConfig): KonnectSDK {
	return new KonnectSDK(config);
}

// ============================================================================
// Default Export
// ============================================================================
export * from "./types";
export default KonnectSDK;
