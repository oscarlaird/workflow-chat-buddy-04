
import { RunMessage as RunMessageType } from "@/types";

interface RunMessageItemProps {
  message: RunMessageType;
}

export const RunMessageItem = ({ message }: RunMessageItemProps) => {
  return (
    <div className="bg-background text-card-foreground p-2 rounded-md border text-sm">
      <p className="text-sm font-medium">{message.type}</p>
    </div>
  );
};

export default RunMessageItem;
