import { Wallet, providers } from 'ethers';
import { ClobClient, Chain } from '@polymarket/clob-client';
import type { ApiKeyCreds } from '@polymarket/clob-client';
import { isValidPrivateKey, normalizePrivateKey, ValidationError } from '../utils/validation.util';

export type CreateClientInput = {
  rpcUrl: string;
  privateKey: string;
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
};

export async function createPolymarketClient(
  input: CreateClientInput,
): Promise<ClobClient & { wallet: Wallet }> {
  try {
    // Validate and normalize private key before creating wallet
    const normalizedPrivateKey = normalizePrivateKey(input.privateKey);
    
    // Create provider with error handling
    let provider: providers.JsonRpcProvider;
    try {
      provider = new providers.JsonRpcProvider(input.rpcUrl);
      // Test connection
      await provider.getNetwork();
    } catch (err) {
      throw new Error(
        `Failed to connect to RPC endpoint: ${input.rpcUrl}\n` +
        `Error: ${err instanceof Error ? err.message : String(err)}\n` +
        `Please verify your RPC_URL is correct and accessible.`
      );
    }

    // Create wallet with validated private key
    let wallet: Wallet;
    try {
      wallet = new Wallet(normalizedPrivateKey, provider);
    } catch (err) {
      throw new Error(
        `Failed to create wallet from private key.\n` +
        `Error: ${err instanceof Error ? err.message : String(err)}\n` +
        `Please verify your PRIVATE_KEY is a valid Polygon (Ethereum-compatible) private key.`
      );
    }

    // Validate wallet address matches expected format
    if (!wallet.address || !/^0x[a-fA-F0-9]{40}$/i.test(wallet.address)) {
      throw new Error(`Invalid wallet address generated: ${wallet.address}`);
    }
    
    let creds: ApiKeyCreds | undefined;
    if (input.apiKey && input.apiSecret && input.apiPassphrase) {
      creds = {
        key: input.apiKey,
        secret: input.apiSecret,
        passphrase: input.apiPassphrase,
      };
    }

    const client = new ClobClient(
      'https://clob.polymarket.com',
      Chain.POLYGON,
      wallet,
      creds,
    );
    
    return Object.assign(client, { wallet });
  } catch (err) {
    if (err instanceof ValidationError) {
      throw err;
    }
    throw new Error(
      `Failed to create Polymarket client: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

