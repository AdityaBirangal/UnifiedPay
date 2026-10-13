import { defineChain } from 'thirdweb/chains';

/**
 * Arc Network Configuration (mainnet + testnet)
 * Arc is an EVM-compatible chain that uses USDC as its native gas token
 * Source: https://docs.arc.io/arc/references/connect-to-arc
 */
import { SUPPORTED_CHAINS, EXPLORER_URLS, NETWORKS, ArcNetwork } from './constants';
import { getRpcUrl } from './blockchain';

// Native gas token on Arc is USDC (18 decimals natively; the ERC-20 interface uses 6)
const ARC_NATIVE_CURRENCY = {
  name: 'USDC',
  symbol: 'USDC',
  decimals: 18,
};

export const ARC_MAINNET = defineChain({
  id: SUPPORTED_CHAINS.ARC_MAINNET,
  name: 'Arc Mainnet',
  rpc: getRpcUrl(SUPPORTED_CHAINS.ARC_MAINNET)!,
  nativeCurrency: ARC_NATIVE_CURRENCY,
  blockExplorers: [
    {
      name: 'Arc Explorer',
      url: EXPLORER_URLS[SUPPORTED_CHAINS.ARC_MAINNET],
    },
  ],
});

export const ARC_TESTNET = defineChain({
  id: SUPPORTED_CHAINS.ARC_TESTNET,
  name: 'Arc Testnet',
  rpc: getRpcUrl(SUPPORTED_CHAINS.ARC_TESTNET)!,
  nativeCurrency: ARC_NATIVE_CURRENCY,
  blockExplorers: [
    {
      name: 'Arc Explorer',
      url: EXPLORER_URLS[SUPPORTED_CHAINS.ARC_TESTNET],
    },
  ],
  testnet: true,
});

/**
 * Get the Arc chain for the selected network
 */
export function getArcChain(network: ArcNetwork) {
  return NETWORKS[network].arcChainId === ARC_TESTNET.id ? ARC_TESTNET : ARC_MAINNET;
}
