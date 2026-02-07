import { createThirdwebClient } from 'thirdweb';

// Create a singleton client instance
let clientInstance: ReturnType<typeof createThirdwebClient> | null = null;

export function getThirdwebClient() {
  if (clientInstance) {
    return clientInstance;
  }

  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      'NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set in environment variables'
    );
  }

  clientInstance = createThirdwebClient({
    clientId: clientId,
  });

  return clientInstance;
}
