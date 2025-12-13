import { KonnectSDK } from './index';

// Mock fetch globally
global.fetch = jest.fn();

describe('KonnectSDK', () => {
  let sdk: KonnectSDK;
  const mockApiKey = 'test-api-key-12345';

  beforeEach(() => {
    sdk = new KonnectSDK({
      apiKey: mockApiKey,
      environment: 'sandbox',
      defaults: {
        receiverWalletId: 'default-wallet-id',
        webhook: 'https://example.com/webhook',
      }
    });
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should create instance with valid config', () => {
      expect(sdk).toBeInstanceOf(KonnectSDK);
      expect(sdk.getEnvironment()).toBe('sandbox');
    });

    it('should use defaults from config', () => {
      const defaults = sdk.getDefaults();
      expect(defaults.receiverWalletId).toBe('default-wallet-id');
      expect(defaults.webhook).toBe('https://example.com/webhook');
    });

    it('should throw error if API key is missing', () => {
      expect(() => {
        new KonnectSDK({ apiKey: '' });
      }).toThrow('API key is required');
    });
  });

  describe('initPayment', () => {
    it('should initialize payment successfully', async () => {
      const mockResponse = {
        payUrl: 'https://dev.konnect.network/pay?ref=test123',
        paymentRef: '60889219a388f75c94a943ec',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { data, error } = await sdk.initPayment({
        amount: 10000,
        orderId: 'test-order',
      });

      expect(error).toBeNull();
      expect(data).toEqual(mockResponse);
    });

    it('should use defaults for receiverWalletId', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payUrl: 'test', paymentRef: 'test' }),
      });

      await sdk.initPayment({ amount: 10000 });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      
      expect(body.receiverWalletId).toBe('default-wallet-id');
    });

    it('should return error on validation failure', async () => {
      const { data, error } = await sdk.initPayment({
        amount: -100, // Invalid amount
      });

      expect(data).toBeNull();
      expect(error).toBeDefined();
      expect(error?.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('getPaymentDetails', () => {
    it('should get payment details successfully', async () => {
      const mockDetails = {
        payment: {
          id: 'test-id',
          status: 'completed',
          amount: 10000,
          token: 'TND',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDetails,
      });

      const { data, error } = await sdk.getPaymentDetails('test-payment-id');

      expect(error).toBeNull();
      expect(data).toEqual(mockDetails);
    });

    it('should return error for invalid payment ID', async () => {
      const { data, error } = await sdk.getPaymentDetails('');

      expect(data).toBeNull();
      expect(error?.code).toBe('VALIDATION_ERROR');
    });
  });
});