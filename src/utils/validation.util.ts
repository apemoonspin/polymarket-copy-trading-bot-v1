/**
 * Validation utilities for addresses, private keys, and configuration
 */

export class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates Ethereum/Polygon address format
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  // Ethereum address: 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/i.test(address.trim());
}

/**
 * Validates Ethereum/Polygon private key format
 */
export function isValidPrivateKey(key: string): boolean {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  const trimmed = key.trim();
  
  // Remove 0x prefix if present
  const cleanKey = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
  
  // Must be exactly 64 hex characters
  return /^[a-fA-F0-9]{64}$/i.test(cleanKey);
}

/**
 * Normalizes private key to standard format (with 0x prefix)
 */
export function normalizePrivateKey(key: string): string {
  if (!key || typeof key !== 'string') {
    throw new ValidationError('Private key must be a non-empty string', 'PRIVATE_KEY');
  }
  
  const trimmed = key.trim();
  
  // Check if it's a Sui key format
  if (trimmed.startsWith('suiprivkey')) {
    throw new ValidationError(
      'Detected Sui private key format. This bot requires Polygon (Ethereum-compatible) private keys.\n' +
      'Please export your Polygon wallet private key (hex format, 64 characters).',
      'PRIVATE_KEY'
    );
  }
  
  // Check if it's a Solana key format (base58)
  if (trimmed.length > 64 && !trimmed.startsWith('0x') && !/^[0-9a-fA-F]+$/.test(trimmed)) {
    throw new ValidationError(
      'Detected invalid private key format. This bot requires Polygon (Ethereum-compatible) private keys.\n' +
      'Please export your Polygon wallet private key (hex format, 64 characters).',
      'PRIVATE_KEY'
    );
  }
  
  // Validate format
  if (!isValidPrivateKey(trimmed)) {
    throw new ValidationError(
      'Invalid private key format. Expected hex format (64 characters, optionally prefixed with 0x).\n' +
      `Got: ${trimmed.substring(0, 20)}... (length: ${trimmed.length})`,
      'PRIVATE_KEY'
    );
  }
  
  // Normalize to include 0x prefix
  const cleanKey = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
  return `0x${cleanKey}`;
}

/**
 * Validates and normalizes Ethereum address
 */
export function normalizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    throw new ValidationError('Address must be a non-empty string', 'ADDRESS');
  }
  
  const trimmed = address.trim();
  
  if (!isValidEthereumAddress(trimmed)) {
    throw new ValidationError(
      `Invalid Ethereum/Polygon address format. Expected format: 0x followed by 40 hex characters.\n` +
      `Got: ${trimmed.substring(0, 20)}...`,
      'ADDRESS'
    );
  }
  
  // Return checksummed address (lowercase for consistency)
  return trimmed.toLowerCase();
}

/**
 * Validates RPC URL format
 */
export function isValidRpcUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates multiple addresses (comma-separated or array)
 */
export function validateAddresses(addresses: string[]): string[] {
  if (!addresses || addresses.length === 0) {
    throw new ValidationError(
      'At least one target address is required',
      'TARGET_ADDRESSES'
    );
  }
  
  const normalized: string[] = [];
  const errors: string[] = [];
  
  addresses.forEach((addr, index) => {
    try {
      normalized.push(normalizeAddress(addr));
    } catch (err) {
      if (err instanceof ValidationError) {
        errors.push(`Address[${index}]: ${err.message}`);
      }
    }
  });
  
  if (errors.length > 0) {
    throw new ValidationError(
      `Invalid addresses found:\n${errors.join('\n')}`,
      'TARGET_ADDRESSES'
    );
  }
  
  return normalized;
}

