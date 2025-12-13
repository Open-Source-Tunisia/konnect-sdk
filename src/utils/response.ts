/**
 * Response wrapping utilities for Better Auth-style responses
 */

import { KonnectSDKError } from '../errors';
import type { ApiResponse } from '../types';

/**
 * Wraps any async function to return Better Auth-style response
 * 
 * @param fn - Function to wrap
 * @returns Promise resolving to {data, error} object
 */
export async function wrapResponse<T>(
  fn: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    if (error instanceof KonnectSDKError) {
      return { data: null, error: error.toJSON() };
    }
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}
