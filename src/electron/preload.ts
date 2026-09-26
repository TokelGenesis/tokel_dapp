import { contextBridge, ipcRenderer } from 'electron';

const SEND_CHANNELS = [
  'bitgo',
  'ipfs',
  'version',
  'window-controls',
  'update-check',
  'update-restart',
] as const;

const RECEIVE_CHANNELS = [
  'bitgo',
  'ipfs',
  'link',
  'version',
  'update-error',
  'update-not-available',
  'update-available',
  'download-progress',
  'update-downloaded',
] as const;

type SendChannel = (typeof SEND_CHANNELS)[number];
type ReceiveChannel = (typeof RECEIVE_CHANNELS)[number];

const api = {
  wallet: {
    encrypt: (walletName: string, dataString: string, password: string): Promise<void> =>
      ipcRenderer.invoke('wallet:encrypt', walletName, dataString, password),
    login: (walletName: string, password: string): Promise<void> =>
      ipcRenderer.invoke('wallet:login', walletName, password),
    changePassword: (walletName: string, currentPassword: string, newPassword: string): Promise<void> =>
      ipcRenderer.invoke('wallet:changePassword', walletName, currentPassword, newPassword),
    listWallets: (): Promise<Array<{ name: string; filename: string }>> =>
      ipcRenderer.invoke('wallet:list'),
  },

  send: (channel: SendChannel, ...args: unknown[]) => {
    if ((SEND_CHANNELS as readonly string[]).includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  on: (channel: ReceiveChannel, listener: (...args: unknown[]) => void): (() => void) => {
    if (!(RECEIVE_CHANNELS as readonly string[]).includes(channel)) {
      return () => {};
    }
    const wrapped = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => listener(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },

  removeAllListeners: (channel: ReceiveChannel) => {
    if ((RECEIVE_CHANNELS as readonly string[]).includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
};

contextBridge.exposeInMainWorld('tokelApi', api);

export type TokelApi = typeof api;
