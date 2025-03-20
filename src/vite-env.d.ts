
/// <reference types="vite/client" />

// Chrome extension API types
interface Chrome {
  runtime: {
    sendMessage: (message: any) => void;
  }
}

declare global {
  interface Window {
    chrome?: Chrome;
  }
}
