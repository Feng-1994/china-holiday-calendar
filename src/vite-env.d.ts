/// <reference types="vite/client" />

declare global {
  interface ElectronAPI {
    openMainWindow: () => void;
    resizeWidget: (width: number, height: number) => void;
  }

  interface Window {
    __ELECTRON__?: boolean;
    electronAPI?: ElectronAPI;
  }
}

export {};
