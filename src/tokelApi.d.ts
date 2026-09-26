interface TokelApi {
  electronDir: string;
  wallet: {
    encrypt(walletName: string, dataString: string, password: string): Promise<void>;
    decrypt(walletName: string, password: string): Promise<string>;
    listWallets(): Promise<Array<{ name: string; filename: string }>>;
  };
  send(channel: string, ...args: unknown[]): void;
  on(channel: string, listener: (...args: unknown[]) => void): () => void;
  removeAllListeners(channel: string): void;
}

interface Window {
  tokelApi: TokelApi;
}
