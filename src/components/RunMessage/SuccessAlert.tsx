
import React from "react";
import { Trophy } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SuccessAlertProps {
  text: string;
}

const SuccessAlert = ({ text }: SuccessAlertProps) => {
  return (
    <Alert className="mt-2 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
      <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle className="text-green-800 dark:text-green-300">Run Completed</AlertTitle>
      <AlertDescription className="text-green-700 dark:text-green-400">
        {text || "The automation run has completed successfully."}
      </AlertDescription>
    </Alert>
  );
};

export default SuccessAlert;
