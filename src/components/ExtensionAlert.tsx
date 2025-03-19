
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExtensionAlertProps {
  runId: string;
}

export const ExtensionAlert = ({ runId }: ExtensionAlertProps) => {
  return (
    <div className="flex justify-center mt-4">
      <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
        <p className="text-amber-800 dark:text-amber-300 mb-2">
          To use this workflow, you need to install the Macro Agents extension first.
        </p>
        <Button 
          onClick={() => window.open('https://chrome.google.com/webstore/category/extensions', '_blank')}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Download className="w-5 h-5" />
          Download Extension
        </Button>
      </div>
    </div>
  );
};

export default ExtensionAlert;
