import 'dotenv/config';
import { KonnectSDK } from './src';

async function main() {
  // Initialize SDK
  const konnect = new KonnectSDK({
    apiKey: process.env.KONNECT_API_KEY || 'your-api-key',
    environment: 'sandbox',
    defaults: {
      receiverWalletId: process.env.KONNECT_WALLET_ID || 'your-wallet-id',
      webhook: process.env.KONNECT_WEBHOOK_URL || 'https://webhook.site/test',
      theme: 'dark',
      lifespan: 30,
      token: 'TND',
    }
  });

  console.log('🔧 SDK initialized');
  console.log('Environment:', konnect.getEnvironment());
  console.log('Defaults:', konnect.getDefaults());
  console.log('');

  // Create a test payment
  console.log('💳 Creating test payment...');
  const { data, error } = await konnect.initPayment({
    amount: 1000, // 1 TND for testing
    orderId: `test-${Date.now()}`,
    email: 'test@example.com',
    description: 'Test payment from SDK',
  });

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    return;
  }

  console.log('✅ Payment created successfully!');
  console.log('Payment URL:', data.payUrl);
  console.log('Payment Ref:', data.paymentRef);
  console.log('');

  // Get payment details
  console.log('📄 Fetching payment details...');
  const { data: details, error: detailsError } = await konnect.getPaymentDetails(
    data.paymentRef
  );

  if (detailsError) {
    console.error('❌ Error fetching details:', detailsError.message);
    return;
  }

  console.log('Payment Status:', details.payment.status);
  console.log('Amount:', details.payment.amount / 1000, 'TND');
  console.log('Expiration:', details.payment.expirationDate);
}

main().catch(console.error);
