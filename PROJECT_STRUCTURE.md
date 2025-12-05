# Project Structure

This document describes the restructured Polymarket Trading Bot project.

## Directory Structure

```
polymarket-trading-bot/
├── src/
│   ├── app/                    # Application entry point
│   │   └── main.ts             # Main application logic
│   ├── cli/                    # CLI commands
│   │   ├── check-allowance.command.ts
│   │   ├── manual-sell.command.ts
│   │   ├── run-simulations.command.ts
│   │   ├── set-token-allowance.command.ts
│   │   └── verify-allowance.command.ts
│   ├── config/                 # Configuration management
│   │   ├── env.ts              # Environment variable loading & validation
│   │   └── copy-strategy.ts    # Trading strategy configuration
│   ├── domain/                 # Domain models and types
│   │   ├── trade.types.ts      # Trade-related type definitions
│   │   └── user.types.ts       # User-related type definitions
│   ├── infrastructure/         # External service integrations
│   │   └── clob-client.factory.ts  # Polymarket CLOB client factory
│   ├── services/               # Business logic services
│   │   ├── mempool-monitor.service.ts    # Mempool monitoring service
│   │   ├── trade-executor.service.ts     # Trade execution service
│   │   └── trade-monitor.service.ts      # Trade monitoring service
│   └── utils/                  # Utility functions
│       ├── validation.util.ts  # Validation utilities (NEW)
│       ├── fetch-data.util.ts  # HTTP request utilities
│       ├── get-balance.util.ts # Balance checking utilities
│       ├── logger.util.ts      # Logging utilities
│       ├── post-order.util.ts  # Order posting utilities
│       └── spinner.util.ts     # CLI spinner utilities
├── docs/                       # Documentation
│   └── GUIDE.md               # Complete setup guide
├── dist/                       # Compiled JavaScript (generated)
├── node_modules/               # Dependencies (generated)
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Example environment file (NEW)
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project overview

```

## Key Improvements

### 1. Validation Module (`src/utils/validation.util.ts`)

New comprehensive validation utilities:
- `isValidEthereumAddress()` - Validates Polygon/Ethereum addresses
- `isValidPrivateKey()` - Validates private key format
- `normalizePrivateKey()` - Normalizes and validates private keys with helpful error messages
- `normalizeAddress()` - Normalizes and validates addresses
- `validateAddresses()` - Validates multiple addresses
- `isValidRpcUrl()` - Validates RPC URL format
- `ValidationError` - Custom error class for validation errors

**Benefits:**
- Clear error messages when configuration is invalid
- Detects common mistakes (Sui/Solana keys instead of Polygon)
- Consistent validation across the codebase

### 2. Enhanced Configuration (`src/config/env.ts`)

Improved environment variable loading:
- Validates all required fields with clear error messages
- Normalizes addresses and private keys
- Validates numeric ranges (e.g., multipliers must be in valid ranges)
- Provides helpful troubleshooting tips in error messages

**Benefits:**
- Catches configuration errors early
- Provides actionable error messages
- Prevents runtime errors from invalid config

### 3. Improved Client Factory (`src/infrastructure/clob-client.factory.ts`)

Enhanced wallet creation:
- Validates private key before creating wallet
- Tests RPC connection before proceeding
- Better error messages for connection issues
- Validates generated wallet address

**Benefits:**
- Fails fast with clear error messages
- Prevents cryptic errors later in execution
- Better debugging experience

### 4. Enhanced Main Application (`src/app/main.ts`)

Improved startup process:
- Better logging with emojis for clarity
- Step-by-step startup messages
- Balance warnings if funds are low
- Comprehensive error handling with troubleshooting tips

**Benefits:**
- Easier to understand what's happening
- Clear warnings about potential issues
- Better user experience

## Configuration Validation

The project now validates configuration at startup:

1. **Address Validation**: Ensures all addresses are valid Polygon addresses (0x...)
2. **Private Key Validation**: Detects and rejects Sui/Solana keys, requires Polygon format
3. **RPC URL Validation**: Ensures RPC URL is accessible and properly formatted
4. **Numeric Validation**: Ensures multipliers and intervals are in valid ranges

## Error Messages

All validation errors now provide:
- Clear description of what's wrong
- What format is expected
- How to fix the issue
- Example values

Example error message:
```
❌ Configuration Error: PRIVATE_KEY
Detected Sui private key format. This bot requires Polygon (Ethereum-compatible) private keys.
Please export your Polygon wallet private key (hex format, 64 characters).

📝 Please fix the error in your .env file and try again.
```

## Running the Project

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env with your credentials:**
   - Use Polygon wallet addresses (0x...)
   - Use Polygon private keys (hex format)
   - Configure target addresses

3. **Build:**
   ```bash
   npm run build
   ```

4. **Run:**
   ```bash
   npm start
   ```

The bot will validate your configuration and provide clear error messages if anything is wrong.

## Development

- `npm run dev` - Run in development mode (TypeScript directly)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript
- `npm run lint` - Run linter

