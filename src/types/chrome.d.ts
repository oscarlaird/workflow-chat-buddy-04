
interface Window {
  chrome?: {
    runtime: {
      sendMessage: (message: any) => void;
    };
  };
}
