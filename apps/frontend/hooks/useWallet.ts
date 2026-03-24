import { useWalletConnection } from '@/app/hooks/useWallet';
import { IWalletHookReturn } from '@/types/escrow';
import { WalletType } from '@/app/services/wallet';

export { useWalletConnection };

// Backward-compatible hook for components using the old { connected, publicKey, connect } shape
export const useWallet = (): IWalletHookReturn => {
  const { isConnected, publicKey, connect } = useWalletConnection();

  return {
    connected: isConnected,
    publicKey: publicKey ?? null,
    connect: () => connect(WalletType.FREIGHTER),
  };
};
