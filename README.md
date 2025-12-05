# Polymarket Trading Bot

> Advanced automated trading bot for Polymarket that monitors mempool transactions and executes frontrunning strategies with configurable gas pricing and trade sizing.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

## Overview

The Polymarket Trading Bot is a sophisticated automated trading system designed for the Polymarket prediction market platform. It employs advanced mempool monitoring techniques to detect pending trades and execute frontrunning strategies with priority gas pricing, enabling users to capitalize on trading opportunities before they are confirmed on-chain.

### Key Capabilities

- **Real-time Mempool Monitoring**: Continuously monitors Polygon mempool for pending Polymarket transactions
- **Hybrid Detection System**: Combines mempool monitoring with Polymarket API polling for comprehensive trade detection
- **Intelligent Frontrunning**: Executes trades with configurable size multipliers and priority gas pricing
- **Robust Error Handling**: Comprehensive validation, retry logic, and error recovery mechanisms
- **Production-Ready**: Built with TypeScript, includes comprehensive validation and logging

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Author & Support](#author--support)

## Features

### Core Functionality

- ✅ **Mempool Transaction Monitoring**: Real-time detection of pending Polymarket transactions
- ✅ **API-Based Trade Detection**: Hybrid approach combining mempool and API monitoring
- ✅ **Priority Execution**: Configurable gas price multipliers for transaction prioritization
- ✅ **Intelligent Trade Sizing**: Frontrun size calculated as percentage of target trade
- ✅ **Balance Validation**: Automatic checks for sufficient USDC and POL balances
- ✅ **Error Recovery**: Retry mechanisms with configurable limits
- ✅ **Comprehensive Logging**: Detailed logging with different severity levels

### Advanced Features

- 🔧 **Configurable Thresholds**: Minimum trade size filters and frontrun multipliers
- 🔧 **Trade Aggregation**: Optional aggregation of trades within time windows
- 🔧 **Multiple Target Support**: Monitor and frontrun multiple trader addresses simultaneously
- 🔧 **CLI Tools**: Utility commands for allowance management and manual operations
- 🔧 **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## Prerequisites

Before installing and running the bot, ensure you have the following:

- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Node Package Manager (included with Node.js)
- **Polygon Wallet**: A wallet with:
  - USDC balance for trading positions
  - POL/MATIC balance for gas fees (recommended: 0.2-1.0 POL minimum)
- **RPC Endpoint**: A Polygon RPC endpoint that supports pending transaction monitoring
  - Recommended providers: [Infura](https://infura.io), [Alchemy](https://alchemy.com), [QuickNode](https://quicknode.com)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd polymarket-trading-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it with your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Configuration](#configuration) section below).

### 4. Build the Project

```bash
npm run build
```

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_KEY` | Your Polygon wallet address (must start with `0x`) | `0x1234...5678` |
| `PRIVATE_KEY` | Your Polygon wallet private key (hex format, 64 characters) | `0xabcd...ef12` |
| `RPC_URL` | Polygon RPC endpoint URL | `https://polygon-rpc.com` |
| `TARGET_ADDRESSES` | Comma-separated list of addresses to frontrun | `0xabc...,0xdef...` |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FETCH_INTERVAL` | `1` | Polling interval in seconds |
| `MIN_TRADE_SIZE_USD` | `100` | Minimum trade size to frontrun (USD) |
| `FRONTRUN_SIZE_MULTIPLIER` | `0.5` | Frontrun size as percentage of target (0.0-1.0) |
| `GAS_PRICE_MULTIPLIER` | `1.2` | Gas price multiplier for priority (e.g., 1.2 = 20% higher) |
| `RETRY_LIMIT` | `3` | Maximum retry attempts for failed orders |
| `USDC_CONTRACT_ADDRESS` | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` | USDC contract on Polygon |
| `TRADE_AGGREGATION_ENABLED` | `false` | Enable trade aggregation |
| `TRADE_AGGREGATION_WINDOW_SECONDS` | `300` | Time window for aggregating trades |

### Example Configuration

```env
# Wallet Configuration
PUBLIC_KEY="0x1234567890abcdef1234567890abcdef12345678"
PRIVATE_KEY="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

# Network Configuration
RPC_URL="https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID"

# Target Addresses
TARGET_ADDRESSES="0x9876543210fedcba9876543210fedcba98765432,0xabcdef1234567890abcdef1234567890abcdef12"

# Trading Parameters
FETCH_INTERVAL=1
MIN_TRADE_SIZE_USD=100
FRONTRUN_SIZE_MULTIPLIER=0.5
GAS_PRICE_MULTIPLIER=1.2
RETRY_LIMIT=3
```

> ⚠️ **Security Note**: Never commit your `.env` file to version control. Keep your private keys secure and use environment variable management in production.

## Usage

### Production Mode

```bash
npm run build
npm start
```

### Development Mode

```bash
npm run dev
```

### CLI Commands

The bot includes several utility commands for managing allowances and positions:

```bash
# Check token allowance
npm run check-allowance

# Verify allowance
npm run verify-allowance

# Set token allowance
npm run set-token-allowance

# Manual sell command
npm run manual-sell

# Run simulations
npm run simulate
```

## Architecture

### Project Structure

```
polymarket-trading-bot/
├── src/
│   ├── app/              # Application entry point
│   ├── cli/              # CLI command utilities
│   ├── config/           # Configuration management
│   ├── domain/           # Domain models and types
│   ├── infrastructure/   # External service integrations
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
├── docs/                 # Documentation
└── dist/                 # Compiled output
```

### Core Components

- **MempoolMonitorService**: Monitors Polygon mempool for pending transactions
- **TradeExecutorService**: Executes frontrunning trades with priority gas pricing
- **Validation Utilities**: Comprehensive validation for addresses, keys, and configuration
- **CLOB Client Factory**: Manages Polymarket CLOB client initialization

### How It Works

1. **Monitoring Phase**: The bot continuously monitors both the Polygon mempool and Polymarket API for pending trades from target addresses
2. **Detection Phase**: When a pending trade is detected, the bot analyzes trade size, market conditions, and transaction status
3. **Validation Phase**: The bot validates sufficient balances, trade size thresholds, and market availability
4. **Execution Phase**: If conditions are met, the bot executes a frontrunning trade with:
   - Calculated frontrun size (based on multiplier)
   - Priority gas pricing (based on gas multiplier)
   - Immediate order submission
5. **Monitoring Phase**: The bot tracks execution status and handles retries if needed

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the bot in production mode |
| `npm run dev` | Run the bot in development mode (TypeScript) |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Automatically fix linting issues |
| `npm run format` | Format code using Prettier |
| `npm run check-allowance` | Check token allowance for trading |
| `npm run verify-allowance` | Verify current token allowance |
| `npm run set-token-allowance` | Set token allowance for trading |
| `npm run manual-sell` | Execute manual sell command |
| `npm run simulate` | Run trading simulations |

## Documentation

For comprehensive documentation, including detailed setup instructions, troubleshooting guides, and advanced configuration options, please refer to:

- **[Complete Guide](./docs/GUIDE.md)**: Detailed setup, configuration, and troubleshooting
- **[Project Structure](./PROJECT_STRUCTURE.md)**: Architecture and code organization

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive error handling
- Add appropriate logging
- Update documentation for new features
- Ensure all tests pass (if applicable)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Author & Support

**DexorynLab**

- **Telegram**: [@dexoryn_12](https://t.me/dexoryn_12)

For support, questions, or feature requests, please reach out via Telegram.

## Disclaimer

⚠️ **Important**: This software is provided as-is without any warranties. Trading cryptocurrencies and prediction markets involves substantial risk of loss. The use of this bot is at your own risk. The authors and contributors are not responsible for any financial losses incurred through the use of this software.

- Always test with small amounts before deploying with significant capital
- Monitor the bot regularly and ensure proper configuration
- Understand the risks associated with automated trading
- Comply with all applicable laws and regulations in your jurisdiction

---

**Made with by DexorynLab**
