import { useWallet as useWalletContext } from "../contexts/WalletContext";



export const useWalletConnection = () => {
  const { wallet, isConnecting, error, connect, disconnect, signMessage } = useWalletContext();

  return {
    isConnected: !!wallet,
    wallet,
    isConnecting,
    error,
    connect,
    disconnect,
    signMessage,
    publicKey: wallet?.publicKey ?? null,
    walletType: wallet?.walletType ?? null,
    network: wallet?.network ?? null,
  };
};