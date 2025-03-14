
import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language = "javascript" }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative group">
      <pre className="font-mono text-sm p-4 bg-gray-950 text-gray-50 rounded-md overflow-x-auto">
        <code>{code}</code>
      </pre>
      
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default CodeBlock;
