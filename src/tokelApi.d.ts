interface TokelApi {
  wallet: {
    encrypt(walletName: string, dataString: string, password: string): Promise<void>;
    login(walletName: string, password: string): Promise<void>;
    changePassword(walletName: string, currentPassword: string, newPassword: string): Promise<void>;
    listWallets(): Promise<Array<{ name: string; filename: string }>>;
  };
  send(channel: string, ...args: unknown[]): void;
  on(channel: string, listener: (...args: unknown[]) => void): () => void;
  removeAllListeners(channel: string): void;
}

interface Window {
  tokelApi: TokelApi;
}
