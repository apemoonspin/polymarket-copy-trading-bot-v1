import {
  normalizeAddress,
  normalizePrivateKey,
  validateAddresses,
  isValidRpcUrl,
  ValidationError,
} from '../utils/validation.util';

export type RuntimeEnv = {
  targetAddresses: string[];
  proxyWallet: string;
  privateKey: string;
  mongoUri?: string;
  rpcUrl: string;
  fetchIntervalSeconds: number;
  tradeMultiplier: number;
  retryLimit: number;
  aggregationEnabled: boolean;
  aggregationWindowSeconds: number;
  usdcContractAddress: string;
  polymarketApiKey?: string;
  polymarketApiSecret?: string;
  polymarketApiPassphrase?: string;
  minTradeSizeUsd?: number; // Minimum trade size to frontrun (USD)
  frontrunSizeMultiplier?: number; // Frontrun size as percentage of target trade (0.0-1.0)
  gasPriceMultiplier?: number; // Gas price multiplier for frontrunning (e.g., 1.2 = 20% higher)
};

export function loadEnv(): RuntimeEnv {
  const parseList = (val: string | undefined): string[] => {
    if (!val) return [];
    try {
      const maybeJson = JSON.parse(val);
      if (Array.isArray(maybeJson)) return maybeJson.map(String);
    } catch (_) {
      // not JSON, parse as comma separated
    }
    return val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const required = (name: string, v: string | undefined): string => {
    if (!v) {
      throw new ValidationError(
        `Missing required environment variable: ${name}\n` +
        `Please set ${name} in your .env file.`,
        name
      );
    }
    return v;
  };

  try {
    // Parse and validate target addresses
    const rawTargetAddresses = parseList(process.env.TARGET_ADDRESSES);
    const targetAddresses = validateAddresses(rawTargetAddresses);

    // Validate and normalize wallet address
    const proxyWallet = normalizeAddress(required('PUBLIC_KEY', process.env.PUBLIC_KEY));

    // Validate and normalize private key
    const privateKey = normalizePrivateKey(required('PRIVATE_KEY', process.env.PRIVATE_KEY));

    // Validate RPC URL
    const rpcUrl = required('RPC_URL', process.env.RPC_URL).trim();
    if (!isValidRpcUrl(rpcUrl)) {
      throw new ValidationError(
        `Invalid RPC_URL format. Expected HTTP or HTTPS URL.\n` +
        `Got: ${rpcUrl}`,
        'RPC_URL'
      );
    }

    // Validate numeric values
    const fetchIntervalSeconds = Number(process.env.FETCH_INTERVAL ?? 1);
    if (isNaN(fetchIntervalSeconds) || fetchIntervalSeconds < 0.1) {
      throw new ValidationError(
        `Invalid FETCH_INTERVAL. Must be a positive number (seconds).\n` +
        `Got: ${process.env.FETCH_INTERVAL}`,
        'FETCH_INTERVAL'
      );
    }

    const frontrunSizeMultiplier = Number(process.env.FRONTRUN_SIZE_MULTIPLIER ?? 0.5);
    if (isNaN(frontrunSizeMultiplier) || frontrunSizeMultiplier < 0 || frontrunSizeMultiplier > 1) {
      throw new ValidationError(
        `Invalid FRONTRUN_SIZE_MULTIPLIER. Must be between 0.0 and 1.0.\n` +
        `Got: ${process.env.FRONTRUN_SIZE_MULTIPLIER}`,
        'FRONTRUN_SIZE_MULTIPLIER'
      );
    }

    const gasPriceMultiplier = Number(process.env.GAS_PRICE_MULTIPLIER ?? 1.2);
    if (isNaN(gasPriceMultiplier) || gasPriceMultiplier < 1.0) {
      throw new ValidationError(
        `Invalid GAS_PRICE_MULTIPLIER. Must be >= 1.0.\n` +
        `Got: ${process.env.GAS_PRICE_MULTIPLIER}`,
        'GAS_PRICE_MULTIPLIER'
      );
    }

    const env: RuntimeEnv = {
      targetAddresses,
      proxyWallet,
      privateKey,
      mongoUri: process.env.MONGO_URI,
      rpcUrl,
      fetchIntervalSeconds,
      tradeMultiplier: Number(process.env.TRADE_MULTIPLIER ?? 1.0),
      retryLimit: Number(process.env.RETRY_LIMIT ?? 3),
      aggregationEnabled: String(process.env.TRADE_AGGREGATION_ENABLED ?? 'false') === 'true',
      aggregationWindowSeconds: Number(process.env.TRADE_AGGREGATION_WINDOW_SECONDS ?? 300),
      usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      polymarketApiKey: process.env.POLYMARKET_API_KEY,
      polymarketApiSecret: process.env.POLYMARKET_API_SECRET,
      polymarketApiPassphrase: process.env.POLYMARKET_API_PASSPHRASE,
      minTradeSizeUsd: Number(process.env.MIN_TRADE_SIZE_USD ?? 100),
      frontrunSizeMultiplier,
      gasPriceMultiplier,
    };

    return env;
  } catch (err) {
    if (err instanceof ValidationError) {
      // Format validation errors nicely
      console.error('\n❌ Configuration Error:', err.field);
      console.error(err.message);
      console.error('\n📝 Please fix the error in your .env file and try again.\n');
      process.exit(1);
    }
    throw err;
  }
}

