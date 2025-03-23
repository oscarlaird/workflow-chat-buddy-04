
import { ChevronDown, ChevronRight, Code, BarChart } from "lucide-react";
import { CodeRunEvent } from "@/hooks/useCodeRunEvents";
import CodeRunEventItem from "./CodeRunEventItem";

interface CodeRunEventsListProps {
  events: CodeRunEvent[];
  hasFunctionCalls: boolean;
  hasProgressBars: boolean;
  functionCallEvents: CodeRunEvent[];
  progressBarEvents: CodeRunEvent[];
  functionCallsExpanded: boolean;
  progressBarsExpanded: boolean;
  setFunctionCallsExpanded: (expanded: boolean) => void;
  setProgressBarsExpanded: (expanded: boolean) => void;
}

const CodeRunEventsList = ({
  events,
  hasFunctionCalls,
  hasProgressBars,
  functionCallEvents,
  progressBarEvents,
  functionCallsExpanded,
  progressBarsExpanded,
  setFunctionCallsExpanded,
  setProgressBarsExpanded
}: CodeRunEventsListProps) => {
  if (events.length === 0) return null;
  
  return (
    <>
      {/* Progress Bars section - Only show if there are progress events */}
      {hasProgressBars && (
        <div className="mt-3 border-t pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setProgressBarsExpanded(!progressBarsExpanded);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
          >
            {progressBarsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <BarChart className="w-4 h-4" />
            <span>Progress Updates</span>
            <span className="text-xs text-muted-foreground">({progressBarEvents.length})</span>
          </button>
          
          {progressBarsExpanded && (
            <div className="space-y-1 mt-2">
              {progressBarEvents.map((event) => (
                <CodeRunEventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Function Calls section */}
      {hasFunctionCalls && (
        <div className="mt-3 border-t pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFunctionCallsExpanded(!functionCallsExpanded);
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
          >
            {functionCallsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Code className="w-4 h-4" />
            <span>Function Calls</span>
            <span className="text-xs text-muted-foreground">({functionCallEvents.length})</span>
          </button>
          
          {functionCallsExpanded && (
            <div className="space-y-1 mt-2">
              {functionCallEvents.map((event) => (
                <CodeRunEventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CodeRunEventsList;
