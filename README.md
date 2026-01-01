# konnect-sdk

A production-ready TypeScript SDK wrapper for [Konnect](https://konnect.network)'s payment API. This is an **unofficial, community-maintained** SDK that adds type-safety, better error handling, and improved developer experience on top of the official Konnect API.

> **Note**: This package is not affiliated with Konnect. It's a community wrapper designed to make integration with Konnect's payment gateway easier and more reliable. Konnect reserves the right to request this project be taken down or transferred to their organization at any time. Just reach out to me.

## Features

- 🔐 **Type-safe** - Full TypeScript support with strict mode
- 🚀 **Zero dependencies** - Minimal footprint, uses native Fetch API
- 🔄 **Automatic retries** - Exponential backoff for resilient requests
- 📦 **ESM & CommonJS** - Works in Node.js and modern browsers
- 🎯 **Better error handling** - Custom error classes with detailed information
- ✅ **Fully tested** - Comprehensive test suite with 100% coverage
- 📚 **Well documented** - Extensive API documentation and examples

## Installation

```bash
npm install konnect-sdk
```

## Quick Start

### Basic Setup

```typescript
import { KonnectSDK } from 'konnect-sdk';

const konnect = new KonnectSDK({
  apiKey: process.env.KONNECT_API_KEY,
  environment: 'sandbox', // or 'production'
});

const { data, error } = await konnect.initPayment({
  amount: 10000, // 10 TND in millimes
  orderId: 'order-123',
  receiverWalletId: 'wallet-id',
});

if (error) {
  console.error('Payment failed:', error.message);
  return;
}

console.log('Pay here:', data.payUrl);
```

### With Type-Safe Config

Create a typed configuration object for better type safety:

```typescript
import { KonnectSDK, type KonnectConfig } from 'konnect-sdk';

const config: KonnectConfig = {
  apiKey: process.env.KONNECT_API_KEY || '',
  environment: 'sandbox',
  timeout: 30000,
  retryAttempts: 3,
  defaults: {
    receiverWalletId: process.env.KONNECT_WALLET_ID,
    webhook: 'https://yourdomain.com/webhook',
    theme: 'dark',
    lifespan: 30,
    token: 'TND',
  },
};

const konnect = new KonnectSDK(config);

const { data, error } = await konnect.initPayment({
  amount: 10000,
  orderId: 'order-123',
});
```

### With Environment Variables (t3-env)

Set up a type-safe environment configuration using `t3-env`:

```typescript
// env.ts
import { z } from 'zod';
import { createEnv } from '@t3-oss/t3-env/node';

export const env = createEnv({
  server: {
    KONNECT_API_KEY: z.string().min(1),
    KONNECT_WALLET_ID: z.string().min(1),
    KONNECT_WEBHOOK_SECRET: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production']),
  },
  runtimeEnv: process.env,
});
```

Then use it in your SDK initialization:

```typescript
import { env } from './env';
import { KonnectSDK } from 'konnect-sdk';

const konnect = new KonnectSDK({
  apiKey: env.KONNECT_API_KEY,
  environment: env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  defaults: {
    receiverWalletId: env.KONNECT_WALLET_ID,
    webhook: `${process.env.APP_URL}/api/webhooks/konnect`,
    theme: 'dark',
    lifespan: 30,
  },
});
```

## Configuration

### SDK Options

```typescript
interface KonnectConfig {
  // Your Konnect API key (required)
  apiKey: string;

  // Environment: 'sandbox' or 'production' (default: 'sandbox')
  environment?: 'sandbox' | 'production';

  // Request timeout in milliseconds (default: 30000)
  timeout?: number;

  // Number of retry attempts for failed requests (default: 3)
  retryAttempts?: number;

  // Default values for all payment requests
  defaults?: {
    receiverWalletId?: string;
    token?: 'TND' | 'EUR' | 'USD';
    type?: 'immediate' | 'partial';
    description?: string;
    webhook?: string;
    theme?: 'light' | 'dark';
    lifespan?: number; // in minutes
    // ... more options
  };
}
```

### Response Format

All API methods return a `{data, error}` tuple similar to Better Auth:

```typescript
const { data, error } = await konnect.initPayment({...});

if (error) {
  // Handle error
  console.error(error.message);
  console.error(error.code); // e.g., 'VALIDATION_ERROR'
} else {
  // Use data
  console.log(data.payUrl);
}
```

## API Reference

### initPayment

Initialize a new payment and receive a payment URL.

```typescript
const { data, error } = await konnect.initPayment({
  // Required
  amount: 10000, // Amount in millimes for TND, centimes for EUR/USD
  receiverWalletId: 'wallet-123', // Can use default

  // Optional
  orderId: 'order-456',
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+21650123456',
  description: 'Purchase of digital goods',
  token: 'TND', // Default: TND
  type: 'immediate', // Default: immediate
  lifespan: 60, // In minutes, default: 30
  theme: 'light', // light or dark
  webhook: 'https://yourapp.com/webhook',
  acceptedPaymentMethods: ['wallet', 'bank_card'],
});

if (data) {
  console.log('Payment URL:', data.payUrl); // Redirect user here
  console.log('Reference:', data.paymentRef); // Store for tracking
}
```

### getPaymentDetails

Retrieve detailed information about a payment.

```typescript
const { data, error } = await konnect.getPaymentDetails('payment-ref-123');

if (data) {
  console.log('Status:', data.payment.status); // 'completed' or 'pending'
  console.log('Amount:', data.payment.amount);
  console.log('Transactions:', data.payment.transactions);
}
```

### isPaymentCompleted

Quick check if a payment was successfully completed.

```typescript
const { data: isCompleted } = await konnect.isPaymentCompleted('payment-ref-123');

if (isCompleted) {
  // Deliver product/service
  await fulfillOrder(orderId);
}
```

### isPaymentExpired

Check if a payment link has expired.

```typescript
const { data: isExpired } = await konnect.isPaymentExpired('payment-ref-123');

if (isExpired) {
  // Prompt user to create a new payment
  console.log('Payment expired, creating new one...');
}
```

### getEnvironment

Get the current SDK environment.

```typescript
const environment = konnect.getEnvironment(); // 'sandbox' or 'production'
```

### getDefaults

Retrieve the default configuration.

```typescript
const defaults = konnect.getDefaults();
console.log(defaults.receiverWalletId);
```

## Examples

### Express Backend Integration

```typescript
import express from 'express';
import { env } from './env';
import { KonnectSDK } from 'konnect-sdk';

const app = express();
const konnect = new KonnectSDK({
  apiKey: env.KONNECT_API_KEY,
  environment: 'sandbox',
  defaults: {
    receiverWalletId: env.KONNECT_WALLET_ID,
    webhook: `https://yourapp.com/api/webhooks/konnect`,
    theme: 'dark',
  },
});

// Create payment endpoint
app.post('/api/payments', express.json(), async (req, res) => {
  const { amount, orderId, email } = req.body;

  // Validate input
  if (!amount || !orderId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await konnect.initPayment({
    amount,
    orderId,
    email,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Save payment reference to database
  await db.payments.create({
    orderId,
    paymentRef: data.paymentRef,
    amount,
    status: 'pending',
  });

  res.json({ payUrl: data.payUrl, paymentRef: data.paymentRef });
});

// Check payment status
app.get('/api/payments/:paymentRef', async (req, res) => {
  const { data: payment, error } = await konnect.getPaymentDetails(
    req.params.paymentRef
  );

  if (error) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  res.json(payment);
});

// Webhook endpoint
app.post('/api/webhooks/konnect', express.json(), async (req, res) => {
  const { paymentRef } = req.body;

  // Verify the payment status
  const { data: payment } = await konnect.getPaymentDetails(paymentRef);

  if (payment?.payment.status === 'completed') {
    // Update order status
    await db.orders.update(
      { paymentRef },
      { status: 'paid', paidAt: new Date() }
    );

    // Deliver product/service
    await fulfillOrder(payment.payment.orderId);
  }

  res.json({ ok: true });
});

app.listen(3000);
```

## Error Handling

The SDK uses custom error classes for different scenarios:

```typescript
import {
  KonnectSDKError,
  ValidationError,
  AuthenticationError,
  PaymentNotFoundError,
} from 'konnect-sdk';

const { data, error } = await konnect.initPayment({...});

if (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      console.error('Invalid request:', error.message);
      break;
    case 'INVALID_AUTH':
      console.error('Invalid API key');
      break;
    case 'PAYMENT_NOT_FOUND':
      console.error('Payment does not exist');
      break;
    case 'REQUEST_FAILED':
      console.error('Network error, retries exhausted');
      break;
    default:
      console.error('Unknown error:', error.message);
  }
}
```

### Error Properties

```typescript
interface KonnectError {
  message: string;        // Human-readable error message
  code?: string;          // Error code identifier
  statusCode?: number;    // HTTP status code
  details?: unknown;      // Additional error context
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Type Safety

The SDK is fully typed and works with TypeScript's strict mode:

```typescript
// ✅ Type-safe - will error if you misspell properties
const { data, error } = await konnect.initPayment({
  amount: 10000,
  orderId: 'order-123',
  invalid_field: 'value', // ❌ TypeScript error
});
```

## Use Defaults for Consistency

Set defaults once during SDK initialization:

```typescript
const konnect = new KonnectSDK({
  apiKey: process.env.KONNECT_API_KEY,
  defaults: {
    receiverWalletId: process.env.KONNECT_WALLET_ID,
    webhook: `${process.env.APP_URL}/webhooks/konnect`,
    theme: 'dark',
  },
});

// Use defaults
await konnect.initPayment({ amount: 10000, orderId: 'abc' });

// Override when needed
await konnect.initPayment({
  amount: 5000,
  orderId: 'xyz',
  theme: 'light', // Override default
});
```

## Konnect API Endpoints

The SDK supports both Konnect environments:

- **Sandbox**: `https://api.sandbox.konnect.network/api/v2`
- **Production**: `https://api.konnect.network/api/v2`

For complete API documentation, visit [Konnect Documentation](https://docs.konnect.network).

## Support

For issues or feature requests:

- 𝕏 [Twitter/X](https://x.com/azizbechaa)
- 🐛 [GitHub Issues](https://github.com/azizbecha/konnect-sdk/issues)
- 💬 [Community Discussion](https://github.com/azizbecha/konnect-sdk/discussions)

For official Konnect support, visit [konnect.network](https://konnect.network)

**Made by [azizbecha](https://github.com/azizbecha) under the [Open Source Tunisia](github.com/open-source-tunisia/konnect-sdk/) organization**
