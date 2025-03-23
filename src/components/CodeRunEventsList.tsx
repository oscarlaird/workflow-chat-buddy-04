
import React from 'react';
import { CodeRunEvent, BrowserEvent } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CodeRunEventItem from './CodeRunEventItem';

interface CodeRunEventsListProps {
  codeRunEvents: CodeRunEvent[];
  browserEvents: Record<string, BrowserEvent[]>;
  isLoading?: boolean;
}

const CodeRunEventsList: React.FC<CodeRunEventsListProps> = ({
  codeRunEvents,
  browserEvents,
  isLoading = false
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
    <div className="space-y-3">
      {codeRunEvents.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <CardHeader className="py-3 px-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  {event.function_name || 'Code Run'}
                </Badge>
                {event.n_progress !== undefined && event.n_total !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    Progress: {event.n_progress}/{event.n_total}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(event.created_at).toLocaleString()}
              </span>
            </div>
            {event.description && (
              <p className="text-sm mt-1">{event.description}</p>
            )}
            {event.n_progress !== undefined && event.n_total !== undefined && event.n_total > 0 && (
              <Progress 
                value={(event.n_progress / event.n_total) * 100} 
                className="h-1 mt-2" 
              />
            )}
          </CardHeader>
          <CardContent className="py-3 px-4">
            {browserEvents[event.id] && browserEvents[event.id].length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {browserEvents[event.id].map((browserEvent) => (
                  <CodeRunEventItem key={browserEvent.id} browserEvent={browserEvent} />
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-sm text-muted-foreground">
                No browser events for this code run
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CodeRunEventsList;
