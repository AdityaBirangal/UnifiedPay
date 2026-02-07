'use client';

import { useState } from 'react';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { prepareContractCall, sendTransaction, waitForReceipt } from 'thirdweb';
import { getContract } from 'thirdweb/contract';
import { getUSDCAddress, parseTokenAmount } from '@/lib/blockchain';
import { getThirdwebClient } from '@/lib/thirdweb-client';
import { PRIMARY_CHAIN_ID, ARC_CHAIN_ID, TOKEN_DECIMALS } from '@/lib/constants';
import { ARC_TESTNET } from '@/lib/chains';

interface PaymentParams {
  itemId: string;
  recipientAddress: string;
  amount: string; // Human-readable amount (e.g., "10.5")
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function usePayment() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executePayment = async ({
    itemId,
    recipientAddress,
    amount,
    onSuccess,
    onError,
  }: PaymentParams): Promise<string | null> => {
    if (!account) {
      const err = new Error('Wallet not connected');
      setError(err.message);
      onError?.(err);
      return null;
    }

    // Check if chain is correct (Arc is now the primary chain)
    if (!chain || chain.id !== ARC_CHAIN_ID) {
      const err = new Error(`Please switch to Arc Testnet (Chain ID: ${ARC_CHAIN_ID})`);
      setError(err.message);
      onError?.(err);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getThirdwebClient();
      const tokenAddress = getUSDCAddress(ARC_CHAIN_ID);

      // Parse amount to smallest unit (USDC uses 6 decimals, not 18)
      const amountWei = parseTokenAmount(amount, TOKEN_DECIMALS);

      // Get contract instance (use Arc chain)
      const contract = getContract({
        client,
        chain: ARC_TESTNET,
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

      // Record payment in database
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: account.address,
          itemId,
          amount: amountWei.toString(), // Store as wei string in database
          txHash,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
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
    isCorrectChain: chain?.id === ARC_CHAIN_ID,
  };
}
