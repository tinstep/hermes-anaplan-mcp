export interface TokenInfo {
  tokenId: string;
  tokenValue: string;
  expiresAt: number;
  refreshTokenId: string;
}

export interface AuthResponse {
  meta: { validationUrl: string };
  status: string;
  statusMessage: string;
  tokenInfo: TokenInfo;
}

// Auth provider contract — schema v2.1-ls
export interface AuthProvider {
  authenticate(): Promise<TokenInfo>;
  refresh(tokenValue: string): Promise<TokenInfo>;
}
