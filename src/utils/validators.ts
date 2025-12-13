/**
 * Validation utilities for SDK operations
 */

import { ValidationError } from '../errors';
import type { KonnectConfig, InitPaymentRequest } from '../types';

/**
 * Validates the SDK configuration
 * 
 * @param config - Configuration to validate
 * @throws {ValidationError} If configuration is invalid
 */
export function validateConfig(config: KonnectConfig): void {
  if (!config.apiKey || config.apiKey.trim() === '') {
    throw new ValidationError('API key is required');
  }

  if (config.timeout && config.timeout < 0) {
    throw new ValidationError('Timeout must be a positive number');
  }

  if (config.retryAttempts && config.retryAttempts < 0) {
    throw new ValidationError('Retry attempts must be a positive number');
  }
}

/**
 * Validates payment initialization request
 * 
 * @param request - Request to validate
 * @throws {ValidationError} If validation fails
 */
export function validateInitPaymentRequest(request: InitPaymentRequest): void {
  if (!request.receiverWalletId) {
    throw new ValidationError('receiverWalletId is required (either in request or defaults)');
  }

  if (!request.amount || request.amount <= 0) {
    throw new ValidationError('amount must be a positive number');
  }

  if (request.email && !isValidEmail(request.email)) {
    throw new ValidationError('Invalid email format');
  }
}

/**
 * Validates email address format
 * 
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates payment ID format
 * 
 * @param paymentId - Payment ID to validate
 * @throws {ValidationError} If paymentId is invalid
 */
export function validatePaymentId(paymentId: string): void {
  if (!paymentId || paymentId.trim() === '') {
    throw new ValidationError('paymentId is required');
  }
}
