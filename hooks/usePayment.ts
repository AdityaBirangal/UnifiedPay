'use client';

import { useState } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { prepareContractCall, sendTransaction, waitForReceipt } from 'thirdweb';
import { getContract } from 'thirdweb/contract';
import { getUSDCAddress, parseTokenAmount } from '@/lib/blockchain';
import { getThirdwebClient } from '@/lib/thirdweb-client';
import { TOKEN_DECIMALS, getNetworkForArcChainId } from '@/lib/constants';
import { getArcChain } from '@/lib/chains';
import { useNetwork } from '@/components/providers/NetworkProvider';
import { useUnifiedBalance } from './useUnifiedBalance';

interface PaymentParams {
  itemId: string;
  recipientAddress: string;
  amount: string; // Human-readable amount (e.g., "10.5")
  chainId?: number; // Arc chain the page accepts payments on (defaults to the selected network)
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function usePayment() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const { arcChain } = useNetwork();
  const { balance: unifiedBalance } = useUnifiedBalance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executePayment = async ({
    itemId,
    recipientAddress,
    amount,
    chainId,
    onSuccess,
    onError,
  }: PaymentParams): Promise<string | null> => {
    if (!account) {
      const err = new Error('Wallet not connected');
      setError(err.message);
      onError?.(err);
      return null;
    }

    // Pay on the page's Arc chain; the wallet must be on it
    const payChain = chainId ? getArcChain(getNetworkForArcChainId(chainId)) : arcChain;
    if (!chain || chain.id !== payChain.id) {
      const err = new Error(`Please switch to ${payChain.name} (Chain ID: ${payChain.id})`);
      setError(err.message);
      onError?.(err);
      return null;
    }

    // Check unified balance (informational - actual check happens on-chain)
    if (unifiedBalance) {
      const totalBalance = parseFloat(unifiedBalance.total);
      const paymentAmount = parseFloat(amount);
      
      if (totalBalance < paymentAmount) {
        // Warning: User might not have sufficient balance
        // But we still allow the payment attempt (on-chain will reject if insufficient)
        console.warn(`Unified balance (${totalBalance} USDC) is less than payment amount (${paymentAmount} USDC)`);
      }
    }

    setLoading(true);
    setError(null);

    try {
      const client = getThirdwebClient();
      const tokenAddress = getUSDCAddress(payChain.id);

      // Parse amount to smallest unit (USDC uses 6 decimals, not 18)
      const amountWei = parseTokenAmount(amount, TOKEN_DECIMALS);

      // Get contract instance (use Arc chain)
      const contract = getContract({
        client,
        chain: payChain,
        address: tokenAddress,
      });

      // Prepare the transfer transaction
      const transaction = prepareContractCall({
        contract,
        method: 'function transfer(address to, uint256 amount) external returns (bool)',
        params: [recipientAddress, amountWei],
      });

      // Send transaction
      const result = await sendTransaction({
        transaction,
        account: account,
      });

      // Wait for receipt
      const receipt = await waitForReceipt(result);

      if (!receipt.status || receipt.status === 'reverted') {
        throw new Error('Transaction failed');
      }

      const txHash = receipt.transactionHash;

      // Record payment in database. The server verifies the tx on-chain and answers 202 while it
      // can't see it yet (its RPC may lag, or confirmation may be slow), so keep retrying.
      const recordPayment = () =>
        fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: account.address,
            itemId,
            amount: amountWei.toString(), // Store as wei string in database
            txHash,
            chainId: payChain.id,
          }),
        });

      const RECORD_TIMEOUT_MS = 2 * 60 * 1000;
      const RECORD_RETRY_DELAY_MS = 3000;
      const recordStartedAt = Date.now();
      let paymentResponse = await recordPayment();
      while (paymentResponse.status === 202 && Date.now() - recordStartedAt < RECORD_TIMEOUT_MS) {
        await new Promise((resolve) => setTimeout(resolve, RECORD_RETRY_DELAY_MS));
        paymentResponse = await recordPayment();
      }

      if (paymentResponse.status === 202) {
        throw new Error(
          `Payment sent but not confirmed on-chain within 2 minutes, so it wasn't recorded yet. Keep your transaction hash (${txHash}) and share it with the creator.`
        );
      }

      const paymentData = await paymentResponse.json();

      // 409 = already recorded (e.g. an earlier retry succeeded) - treat as success
      if (!paymentResponse.ok && paymentResponse.status !== 409) {
        // Payment was sent but recording failed - this is a problem
        console.error('Payment sent but recording failed:', paymentData);
        throw new Error(paymentData.error || 'Payment sent but failed to record');
      }

      setLoading(false);
      onSuccess?.(txHash);
      return txHash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Payment failed');
      setError(error.message);
      setLoading(false);
      onError?.(error);
      return null;
    }
  };

  return {
    executePayment,
    loading,
    error,
    isConnected: !!account,
    isCorrectChain: chain?.id === arcChain.id,
    arcChain,
  };
}
