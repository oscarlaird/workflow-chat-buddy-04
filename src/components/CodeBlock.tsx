
import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    <div className="relative group">
      <ScrollArea className="max-h-[400px] w-full rounded-md" type="hover">
        <div className="w-full">
          <SyntaxHighlighter
            language={language}
            style={isDark ? vscDarkPlus : vs}
            className="rounded-md text-sm font-mono"
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.375rem',
              background: isDark ? '#0f1629' : '#f8f9fc',
            }}
            wrapLines={false}
            wrapLongLines={false}
          >
            {code}
          </SyntaxHighlighter>
        </div>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
      
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
