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

export interface AuthProvider {
  authenticate(): Promise<TokenInfo>;
  refresh(tokenValue: string): Promise<TokenInfo>;
}
