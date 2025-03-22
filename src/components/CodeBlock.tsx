
import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language = "javascript" }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative w-full h-full">
      <SyntaxHighlighter
        language={language}
        style={isDark ? vscDarkPlus : vs}
        className="rounded-md text-sm font-mono w-full h-full"
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.375rem',
          background: isDark ? '#0f1629' : '#f8f9fc',
          width: '100%',
          height: '100%',
          minHeight: '100%',
          overflowY: 'auto',
        }}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
      
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 rounded-md bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors z-10"
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
