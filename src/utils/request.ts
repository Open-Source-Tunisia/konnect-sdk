/**
 * HTTP request utilities with retry logic
 */

import { KonnectSDKError, AuthenticationError, PaymentNotFoundError, ValidationError } from '../errors';

/**
 * Makes an HTTP request with retry logic and exponential backoff
 * 
 * @param url - Full URL to request
 * @param options - Fetch options
 * @param config - Request configuration
 * @returns Promise resolving to the response data
 * @throws {KonnectSDKError} If request fails after all retries
 */
export async function makeRequest<T>(
  url: string,
  options: RequestInit,
  config: {
    timeout: number;
    retryAttempts: number;
  }
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 429
      if (error instanceof KonnectSDKError && error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
      }

      // Don't retry on the last attempt
      if (attempt === config.retryAttempts - 1) {
        break;
      }

      // Exponential backoff
      await sleep(2 ** attempt * 1000);
    }
  }

  clearTimeout(timeoutId);
  throw new KonnectSDKError(
    lastError?.message || 'Request failed after retries',
    undefined,
    'REQUEST_FAILED'
  );
}

/**
 * Handles error responses from the API
 * 
 * @param response - HTTP response object
 * @throws {AuthenticationError} If authentication fails (401)
 * @throws {PaymentNotFoundError} If payment not found (404)
 * @throws {ValidationError} If validation fails (400)
 * @throws {KonnectSDKError} For other errors
 */
export async function handleErrorResponse(response: Response): Promise<never> {
  let errorData: unknown;
  
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText };
  }

  const data = errorData as Record<string, unknown>;

  switch (response.status) {
    case 401:
      throw new AuthenticationError();
    case 404:
      throw new PaymentNotFoundError((data.paymentId as string) || 'unknown');
    case 400:
      throw new ValidationError(
        (data.message as string) || 'Validation failed',
        data
      );
    default:
      throw new KonnectSDKError(
        (data.message as string) || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data.code as string,
        data
      );
  }
}

/**
 * Sleep utility for retry logic with exponential backoff
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
