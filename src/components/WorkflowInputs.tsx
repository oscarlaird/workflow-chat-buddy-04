import { useState, useEffect, useRef } from "react";
import { Plus, Trash, Upload, AlertCircle } from "lucide-react";
import { InputField, InputValues } from "@/types";
import { useSelectedChatSettings } from "@/hooks/useSelectedChatSettings";
import { TypedInputField, InputFieldIcon } from "@/components/InputField";
import { formatFieldName, parseSpreadsheetFile, mapSpreadsheetToInputSchema } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { 
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WorkflowInputsProps {
  chatId?: string;
  onInputValuesChange?: (values: InputValues) => void;
  showRunButton?: boolean;
  onRunWorkflow?: () => void;
  isRunning?: boolean;
  onSubmit: (inputValues: InputValues) => void;
  disabled: boolean;
}

export const WorkflowInputs = ({ 
  chatId,
  onInputValuesChange,
  showRunButton = true,
  onRunWorkflow,
  isRunning = false,
  onSubmit,
  disabled
}: WorkflowInputsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    exampleInputs,
    inferredSchema,
    isLoading
  } = useSelectedChatSettings(chatId);

  useEffect(() => {
    // Initialize input values from example inputs if available
    if (exampleInputs) {
      setInputValues({...exampleInputs});
    } else {
      // Otherwise initialize with default values based on inferred schema
      const initialValues: InputValues = {};
      inferredSchema.forEach((field: InputField) => {
        if (field.type === 'string' || field.type === 'person' || field.type === 'email' || 
            field.type === 'phone' || field.type === 'address' || field.type === 'url' || 
            field.type === 'zip_code' || field.type === 'state' || field.type === 'country') {
          initialValues[field.field_name] = '';
        }
        else if (field.type === 'number' || field.type === 'integer' || 
                field.type === 'currency' || field.type === 'percentage' || field.type === 'year') {
          initialValues[field.field_name] = 0;
        }
        else if (field.type === 'date') {
          initialValues[field.field_name] = '';
        }
        else if (field.type === 'bool') {
          initialValues[field.field_name] = false;
        }
        else if (field.type === 'table') {
          // For table type, initialize with an empty array
          initialValues[field.field_name] = [];
        }
      });
      
      setInputValues(initialValues);
    }
  }, [exampleInputs, inferredSchema]);

  useEffect(() => {
    if (onInputValuesChange) {
      onInputValuesChange(inputValues);
    }
  }, [inputValues, onInputValuesChange]);

  const handleRunWorkflow = () => {
    console.log("Run button clicked in WorkflowInputs");
    
    if (!onSubmit) {
      console.error("onSubmit handler is not provided to WorkflowInputs");
      return;
    }
    
    console.log("Submitting input values:", inputValues);
    
    // Call the onSubmit handler with the input values
    onSubmit(inputValues);
    
    // Notify the parent component if there's an onRunWorkflow callback
    if (onRunWorkflow) {
      console.log("Calling onRunWorkflow callback from WorkflowInputs");
      onRunWorkflow();
    }
  };

  const handleRunCode = async () => {
    if (!chatId) {
      console.error("Cannot run code without a chat ID");
      return;
    }

    try {
      const messageId = uuidv4();
      
      const messageData = {
        id: messageId,
        chat_id: chatId,
        role: 'user',
        content: 'Please execute my workflow',
        username: 'current_user',
        requires_text_reply: false,
        code_run: true
      };
      
      await supabase.from('messages').insert(messageData);
      
      toast({
        title: "Code execution requested",
        description: "Your workflow code will be executed"
      });
    } catch (error) {
      console.error('Error requesting code execution:', error);
      toast({
        title: "Error",
        description: "Failed to request code execution",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (name: string, value: string | number | boolean | Array<any>) => {
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Only accept .csv files
      if (!file.name.endsWith('.csv')) {
        throw new Error('Only CSV files are supported');
      }

      // Parse the file
      const data = await parseSpreadsheetFile(file);
      
      // Map the data to the input schema
      const mappedData = mapSpreadsheetToInputSchema(data, inferredSchema);
      
      if (mappedData.length === 0) {
        throw new Error('No valid data found in the file');
      }

      // Use the first row of data
      setInputValues(mappedData[0]);
      toast({
        title: "Data imported",
        description: `Imported the first row from ${file.name}`,
      });
      
      setShowUploadDialog(false);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    setShowUploadDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Workflow Inputs</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={triggerFileUpload}
          >
            <Upload className="h-4 w-4 mr-1" />
            <span>Import</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-4 mb-4">
        {inferredSchema.map((field) => (
          <div key={field.field_name} className="space-y-2">
            <label htmlFor={field.field_name} className="flex items-center gap-1.5 capitalize">
              <InputFieldIcon type={field.type} className="text-muted-foreground" />
              <span>{formatFieldName(field.field_name)}</span>
            </label>
            <TypedInputField
              field={field}
              value={inputValues[field.field_name]}
              onChange={handleInputChange}
            />
          </div>
        ))}

        {inferredSchema.length === 0 && (
          <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
            No example inputs available. Please add example inputs to your workflow.
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {showRunButton && (
          <button
            onClick={handleRunWorkflow}
            disabled={disabled || isRunning}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>Run Workflow</span>
              </>
            )}
          </button>
        )}
        
        <button
          onClick={handleRunCode}
          disabled={disabled || isRunning}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70"
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>Run Code</span>
        </button>
      </div>

      {/* File Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Spreadsheet Data</DialogTitle>
            <DialogDescription>
              Upload a CSV file to populate the workflow inputs. The first row should contain headers that match your input fields.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop a CSV file, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Browse Files</span>
                )}
              </Button>
              
              {uploadError && (
                <div className="mt-3 text-destructive text-sm flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <p>CSV file requirements:</p>
            <ul className="list-disc ml-4 mt-1">
              <li>First row must be headers that match your input fields</li>
              <li>Each row represents one set of inputs</li>
              <li>Format: text values, numbers, true/false for boolean fields</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowInputs;
