// Update the import - use the correct way to access freighter
declare global {
  interface Window {
    freighter?: FreighterWallet;
  }
}

export interface FreighterWallet {
  isConnected: () => Promise<boolean>;
  getPublicKey: () => Promise<string>;
  signTransaction: (xdr: string, opts?: Record<string, unknown>) => Promise<string>;
  getNetwork: () => Promise<string>;
  enable: () => Promise<void>;
  signMessage: (message: string) => Promise<string | { signature: string }>;
}

export class FreighterService {
  private static instance: FreighterService;

  private constructor() {}

  public static getInstance(): FreighterService {
    if (!FreighterService.instance) {
      FreighterService.instance = new FreighterService();
    }
    return FreighterService.instance;
  }

  private async getFreighter(): Promise<FreighterWallet> {
    // Check if freighter is available
    if (typeof window === 'undefined') {
      throw new Error('Window is not defined');
    }
    
    // Freighter injects itself into the window object
    if (!window.freighter) {
      throw new Error('Freighter wallet is not installed');
    }
    
    return window.freighter;
  }

  async isInstalled(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;
      return !!window.freighter;
    } catch {
      return false;
    }
  }

  async connect(): Promise<string> {
    try {
      const freighter = await this.getFreighter();
      
      // Enable freighter
      await freighter.enable();
      
      // Get public key
      const publicKey = await freighter.getPublicKey();
      
      return publicKey;
    } catch (error: unknown) {
      throw new Error(`Failed to connect to Freighter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNetwork(): Promise<string> {
    try {
      const freighter = await this.getFreighter();
      const network = await freighter.getNetwork();
      return network.toLowerCase(); // Convert to lowercase for consistency
    } catch {
      throw new Error('Failed to get network from Freighter');
    }
  }

  async signTransaction(xdr: string): Promise<string> {
    try {
      const freighter = await this.getFreighter();
      const network = await this.getNetwork();

      const signedXdr = await freighter.signTransaction(xdr, {
        network,
        accountToSign: await freighter.getPublicKey(),
      });

      return signedXdr;
    } catch (error: unknown) {
      throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const freighter = await this.getFreighter();
      // window.freighter.signMessage returns a base64-encoded Ed25519 signature
      const result = await freighter.signMessage(message);
      const sigBase64 = typeof result === 'string' ? result : result.signature;
      // Convert base64 → hex as expected by the backend
      return Buffer.from(sigBase64, 'base64').toString('hex');
    } catch (error: unknown) {
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}