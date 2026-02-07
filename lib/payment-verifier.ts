import { ethers } from 'ethers';
import { getProvider, getTokenContract, getUSDCAddress, formatTokenAmount } from './blockchain';
import { normalizeAddress } from './wallet';
import { getCachedVerification, setCachedVerification } from './verification-cache';
import { PRIMARY_CHAIN_ID, TOKEN_DECIMALS } from './constants';

interface PaymentVerification {
  isValid: boolean;
  txHash: string;
  from: string;
  to: string;
  amount: string; // in wei
  blockNumber: number;
  timestamp: number;
  error?: string;
}

/**
 * Verify a payment transaction on the blockchain
 */
export async function verifyPayment(
  txHash: string,
  expectedTo: string,
  expectedAmount?: string // in wei, optional for open payments
): Promise<PaymentVerification> {
  try {
    // Check cache first (for basic validation, full verification still needed for amount/recipient)
    // Cache helps reduce calls when same tx is verified multiple times
    const cached = getCachedVerification(txHash);
    
    const targetChainId = PRIMARY_CHAIN_ID; // Verify on Arc (primary chain)
    const provider = getProvider(targetChainId);
    const tokenAddress = getUSDCAddress(targetChainId);
    const normalizedTo = normalizeAddress(expectedTo);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        isValid: false,
        txHash,
        from: '',
        to: '',
        amount: '0',
        blockNumber: 0,
        timestamp: 0,
        error: 'Transaction not found',
      };
    }

    if (receipt.status !== 1) {
      return {
        isValid: false,
        txHash,
        from: '',
        to: '',
        amount: '0',
        blockNumber: receipt.blockNumber,
        timestamp: 0,
        error: 'Transaction failed or reverted',
      };
    }

    // Get block timestamp
    const block = await provider.getBlock(receipt.blockNumber);
    const timestamp = block?.timestamp || 0;

    // Get token contract
    const contract = getTokenContract(targetChainId, provider);
    const tokenInterface = contract.interface;

    // Find Transfer events in the transaction
    const transferEvents: Array<{
      from: string;
      to: string;
      value: bigint;
    }> = [];

    for (const log of receipt.logs) {
      // Check if this log is from the token contract
      if (log.address.toLowerCase() !== tokenAddress.toLowerCase()) {
        continue;
      }

      try {
        const parsedLog = tokenInterface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });

        if (parsedLog && parsedLog.name === 'Transfer') {
          transferEvents.push({
            from: parsedLog.args[0] as string,
            to: parsedLog.args[1] as string,
            value: parsedLog.args[2] as bigint,
          });
        }
      } catch (e) {
        // Not a Transfer event, skip
        continue;
      }
    }

    // Find transfer to the expected recipient
    const relevantTransfer = transferEvents.find(
      (event) => normalizeAddress(event.to) === normalizedTo
    );

    if (!relevantTransfer) {
      return {
        isValid: false,
        txHash,
        from: '',
        to: '',
        amount: '0',
        blockNumber: receipt.blockNumber,
        timestamp,
        error: 'No transfer found to expected recipient',
      };
    }

    const amountWei = relevantTransfer.value.toString();

    // If expected amount is provided, validate it
    if (expectedAmount && amountWei !== expectedAmount) {
      return {
        isValid: false,
        txHash,
        from: normalizeAddress(relevantTransfer.from),
        to: normalizedTo,
        amount: amountWei,
        blockNumber: receipt.blockNumber,
        timestamp,
        error: `Amount mismatch. Expected ${expectedAmount}, got ${amountWei}`,
      };
    }

    const result = {
      isValid: true,
      txHash,
      from: normalizeAddress(relevantTransfer.from),
      to: normalizedTo,
      amount: amountWei,
      blockNumber: receipt.blockNumber,
      timestamp,
    };

    // Cache successful verification
    setCachedVerification(txHash, true);

    return result;
  } catch (error) {
    console.error('Error verifying payment:', error);
    const result = {
      isValid: false,
      txHash,
      from: '',
      to: '',
      amount: '0',
      blockNumber: 0,
      timestamp: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    // Cache failed verification (shorter TTL could be used)
    setCachedVerification(txHash, false);

    return result;
  }
}

/**
 * Scan for Transfer events to a specific address within a block range
 */
export async function scanTransfersToAddress(
  recipientAddress: string,
  fromBlock: number,
  toBlock: number,
  chainId?: number
): Promise<Array<{
  txHash: string;
  from: string;
  to: string;
  amount: string; // in wei
  blockNumber: number;
}>> {
  try {
    const provider = getProvider(chainId);
    const contract = getTokenContract(chainId, provider);
    const normalizedRecipient = normalizeAddress(recipientAddress);

    // Create filter for Transfer events to the recipient
    const filter = contract.filters.Transfer(null, normalizedRecipient);

    // Query events
    const events = await contract.queryFilter(filter, fromBlock, toBlock);

    return events
      .filter((event): event is ethers.EventLog => 'args' in event)
      .map((event) => ({
        txHash: event.transactionHash,
        from: normalizeAddress(event.args[0] as string),
        to: normalizedRecipient,
        amount: event.args[2].toString(),
        blockNumber: event.blockNumber,
      }));
  } catch (error) {
    console.error('Error scanning transfers:', error);
    return [];
  }
}
