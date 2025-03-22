
import { useState } from "react";
import { CodeRunEvent } from "@/hooks/useCodeRunEvents";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Code, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

interface CodeRunEventItemProps {
  event: CodeRunEvent;
}

const CodeRunEventItem = ({ event }: CodeRunEventItemProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const hasInput = event.example_input && Object.keys(event.example_input).length > 0;
  const hasOutput = event.example_output !== null;
  
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };
  
  return (
    <Card className="mb-2 overflow-hidden border-dashed">
      <CardHeader className="p-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-500" />
            <div className="font-medium text-sm">
              {event.function_name || "Function call"}
            </div>
            <Badge variant="outline" className="text-xs py-0 h-5">
              {formatTime(event.created_at)}
            </Badge>
          </div>
          {(hasInput || hasOutput) && (
            <div>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          )}
        </div>
      </CardHeader>
      
      {expanded && (hasInput || hasOutput) && (
        <CardContent className="p-2 pt-0">
          {hasInput && (
            <div className="mb-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">Input:</div>
              <CodeBlock 
                code={JSON.stringify(event.example_input, null, 2)} 
                language="json" 
              />
            </div>
          )}
          
          {hasOutput && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Output:</div>
              <CodeBlock 
                code={JSON.stringify(event.example_output, null, 2)} 
                language="json" 
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CodeRunEventItem;
