
import React from 'react';
import { CodeRunEvent, BrowserEvent } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CodeRunEventItem from './CodeRunEventItem';
import { ScrollArea } from './ui/scroll-area';

interface CodeRunEventsListProps {
  codeRunEvents: CodeRunEvent[];
  browserEvents: Record<string, BrowserEvent[]>;
  isLoading?: boolean;
  maxHeight?: string;
}

const CodeRunEventsList: React.FC<CodeRunEventsListProps> = ({
  codeRunEvents,
  browserEvents,
  isLoading = false,
  maxHeight = '400px'
}) => {
  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Loading code run events...</span>
      </Card>
    );
  }

  if (codeRunEvents.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex flex-col items-center justify-center text-center py-6">
          <Terminal className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No code run events</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Code run events will appear here when they occur
          </p>
        </div>
      </Card>
    );
  }

  return (
    <ScrollArea className={`max-h-[${maxHeight}]`} type="auto">
      <div className="space-y-3 p-2">
        {codeRunEvents.map((event) => (
          <CodeRunEventItem key={event.id} event={event} browserEvents={browserEvents[event.id] || []} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default CodeRunEventsList;
