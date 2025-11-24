/**
 * GitHub Token Load Balancer
 * Distributes API calls across multiple GitHub tokens to avoid rate limits
 */

export class GitHubTokenManager {
  private tokens: string[];
  private currentIndex: number = 0;
  private tokenUsage: Map<string, number> = new Map();
  private tokenLimits: Map<string, number> = new Map();

  constructor() {
    // Initialize tokens from environment variables
    this.tokens = [
      process.env.GITHUB_TOKEN,
      process.env.GITHUB_TOKEN_2,
      process.env.GITHUB_TOKEN_3,
      process.env.GITHUB_TOKEN_4,
      process.env.GITHUB_TOKEN_5,
    ].filter(Boolean) as string[];

    console.log(`🔑 Loaded ${this.tokens.length} GitHub tokens`);
    if (this.tokens.length === 0) {
      console.error('❌ No GitHub tokens found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('GITHUB')));
      throw new Error('No GitHub tokens configured');
    }

    // Initialize usage tracking
    this.tokens.forEach(token => {
      this.tokenUsage.set(token, 0);
      this.tokenLimits.set(token, 5000); // Default rate limit per hour
    });
  }

  /**
   * Get the best token for a specific purpose
   */
  getTokenForPurpose(purpose: 'user' | 'community' | 'heavy' | 'background'): string {
    switch (purpose) {
      case 'user':
        return this.getTokenByIndex(0); // Primary token for user data
      case 'community':
        return this.getTokenByIndex(1); // Second token for community data
      case 'heavy':
        return this.getTokenByIndex(2); // Third token for heavy operations
      case 'background':
        return this.getTokenByIndex(3); // Fourth token for background tasks
      default:
        return this.getNextToken();
    }
  }

  /**
   * Get next available token (round-robin)
   */
  getNextToken(): string {
    const token = this.tokens[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.tokens.length;
    return token;
  }

  /**
   * Get token by specific index
   */
  getTokenByIndex(index: number): string {
    return this.tokens[index % this.tokens.length];
  }

  /**
   * Get token with lowest usage
   */
  getLeastUsedToken(): string {
    let minUsage = Infinity;
    let bestToken = this.tokens[0];

    for (const token of this.tokens) {
      const usage = this.tokenUsage.get(token) || 0;
      if (usage < minUsage) {
        minUsage = usage;
        bestToken = token;
      }
    }

    return bestToken;
  }

  /**
   * Record API call for a token
   */
  recordApiCall(token: string, calls: number = 1): void {
    const currentUsage = this.tokenUsage.get(token) || 0;
    this.tokenUsage.set(token, currentUsage + calls);
  }

  /**
   * Get token usage statistics
   */
  getTokenStats(): Array<{ token: string; usage: number; limit: number; percentage: number }> {
    return this.tokens.map(token => {
      const usage = this.tokenUsage.get(token) || 0;
      const limit = this.tokenLimits.get(token) || 5000;
      return {
        token: token.substring(0, 8) + '...', // Mask token for security
        usage,
        limit,
        percentage: (usage / limit) * 100
      };
    });
  }

  /**
   * Reset usage counters (call this periodically)
   */
  resetUsage(): void {
    this.tokens.forEach(token => {
      this.tokenUsage.set(token, 0);
    });
  }

  /**
   * Check if any token is approaching rate limit
   */
  isAnyTokenNearLimit(threshold: number = 80): boolean {
    return this.tokens.some(token => {
      const usage = this.tokenUsage.get(token) || 0;
      const limit = this.tokenLimits.get(token) || 5000;
      return (usage / limit) * 100 >= threshold;
    });
  }

  /**
   * Get available tokens count
   */
  getTokenCount(): number {
    return this.tokens.length;
  }
}

// Export singleton instance (lazy-loaded)
let _tokenManager: GitHubTokenManager | null = null;

export const tokenManager = {
  getTokenForPurpose: (purpose: 'user' | 'community' | 'heavy' | 'background') => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.getTokenForPurpose(purpose);
  },
  getNextToken: () => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.getNextToken();
  },
  getTokenByIndex: (index: number) => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.getTokenByIndex(index);
  },
  getLeastUsedToken: () => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.getLeastUsedToken();
  },
  recordApiCall: (token: string, calls: number = 1) => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.recordApiCall(token, calls);
  },
  getTokenStats: () => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.getTokenStats();
  },
  resetUsage: () => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.resetUsage();
  },
  isAnyTokenNearLimit: (threshold: number = 80) => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.isAnyTokenNearLimit(threshold);
  },
  getTokenCount: () => {
    if (!_tokenManager) {
      _tokenManager = new GitHubTokenManager();
    }
    return _tokenManager.getTokenCount();
  }
};
