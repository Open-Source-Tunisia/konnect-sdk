/**
 * Custom error classes for the SDK
 */

import type { KonnectError } from '../types';

/**
 * Base error class for Konnect SDK errors
 */
export class KonnectSDKError extends Error {
  /**
   * Creates a new KonnectSDKError
   * 
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param code - Error code identifier
   * @param details - Additional error details
   */
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'KonnectSDKError';
    Object.setPrototypeOf(this, KonnectSDKError.prototype);
  }

  /**
   * Converts error to JSON format
   * 
   * @returns Error object in JSON format
   */
  toJSON(): KonnectError {
    return {
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Error thrown when a payment is not found
 */
export class PaymentNotFoundError extends KonnectSDKError {
  /**
   * Creates a new PaymentNotFoundError
   * 
   * @param paymentId - The payment ID that was not found
   */
  constructor(paymentId: string) {
    super(`Payment with ID ${paymentId} not found`, 404, 'PAYMENT_NOT_FOUND');
    this.name = 'PaymentNotFoundError';
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends KonnectSDKError {
  /**
   * Creates a new AuthenticationError
   */
  constructor() {
    super('Invalid or missing API key', 401, 'INVALID_AUTH');
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends KonnectSDKError {
  /**
   * Creates a new ValidationError
   * 
   * @param message - Validation error message
   * @param details - Additional validation details
   */
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
