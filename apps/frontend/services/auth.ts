import { apiClient } from '@/lib/api-client';

interface ChallengeResponse {
  nonce: string;
  message: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async getChallenge(walletAddress: string): Promise<ChallengeResponse> {
    return apiClient.post<ChallengeResponse>('/auth/challenge', { walletAddress });
  }

  static async verify(
    walletAddress: string,
    signature: string,
    publicKey: string,
  ): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/auth/verify', {
      walletAddress,
      signature,
      publicKey,
    });
  }

  static async refresh(refreshToken: string): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/auth/refresh', { refreshToken });
  }

  static async logout(): Promise<void> {
    const refreshToken = apiClient.getRefreshToken();
    if (refreshToken) {
      await apiClient.post<void>('/auth/logout', { refreshToken }).catch(() => {});
    }
    apiClient.clearTokens();
  }

  /**
   * Full authentication flow:
   * 1. Request a challenge from the backend
   * 2. Sign the challenge message with the wallet (hex-encoded Ed25519 signature)
   * 3. Verify with the backend and store the returned JWT tokens
   *
   * @param walletAddress - Stellar public key (G...)
   * @param signMessage   - Wallet service method that signs raw text and returns hex signature
   */
  static async authenticate(
    walletAddress: string,
    signMessage: (message: string) => Promise<string>,
  ): Promise<void> {
    const { message } = await AuthService.getChallenge(walletAddress);
    const signature = await signMessage(message);
    const { accessToken, refreshToken } = await AuthService.verify(
      walletAddress,
      signature,
      walletAddress, // publicKey === walletAddress for Stellar Ed25519 keys
    );
    apiClient.setTokens(accessToken, refreshToken);
  }

  static isAuthenticated(): boolean {
    return !!apiClient.getAccessToken();
  }
}
