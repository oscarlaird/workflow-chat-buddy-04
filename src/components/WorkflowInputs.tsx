import { useState, useEffect, useRef } from "react";
import { Plus, Trash, Table, List, Upload, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InputField, InputValues } from "@/types";
import { useSelectedChatSettings } from "@/hooks/useSelectedChatSettings";
import { TypedInputField, InputFieldIcon } from "@/components/InputField";
import { formatFieldName, parseSpreadsheetFile, mapSpreadsheetToInputSchema } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
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
  onInputValuesChange?: (values: InputValues | InputValues[]) => void;
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
  const [tabularData, setTabularData] = useState<InputValues[]>([{}]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    multiInput, 
    inputSchema, 
    isLoading, 
    isSaving, 
    updateMultiInput 
  } = useSelectedChatSettings(chatId);

  useEffect(() => {
    const initialValues: InputValues = {};
    inputSchema.forEach((field: InputField) => {
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
    });
    
    setInputValues(initialValues);
    setTabularData([{...initialValues}]);
  }, [inputSchema]);

  useEffect(() => {
    if (onInputValuesChange) {
      onInputValuesChange(multiInput ? tabularData : inputValues);
    }
  }, [inputValues, tabularData, multiInput, onInputValuesChange]);

  const toggleInputMode = async () => {
    await updateMultiInput(!multiInput);
  };

  const handleRunWorkflow = () => {
    console.log("Run button clicked in WorkflowInputs");
    
    if (!onSubmit) {
      console.error("onSubmit handler is not provided to WorkflowInputs");
      return;
    }
    
    console.log("Submitting input values:", multiInput ? tabularData : inputValues);
    
    // Call the onSubmit handler with either the single input values or the first row of tabular data
    if (multiInput) {
      if (tabularData.length > 0) {
        onSubmit(tabularData[0]);
      } else {
        console.error("No tabular data available to submit");
        toast({
          title: "Error",
          description: "No data available to submit",
          variant: "destructive"
        });
      }
    } else {
      onSubmit(inputValues);
    }
    
    // Notify the parent component if there's an onRunWorkflow callback
    if (onRunWorkflow) {
      console.log("Calling onRunWorkflow callback from WorkflowInputs");
      onRunWorkflow();
    }
  };

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabularInputChange = (rowIndex: number, name: string, value: string | number | boolean) => {
    setTabularData(prev => {
      const newData = [...prev];
      if (!newData[rowIndex]) {
        newData[rowIndex] = {};
      }
      newData[rowIndex] = {
        ...newData[rowIndex],
        [name]: value
      };
      return newData;
    });
  };

  const addTableRow = () => {
    setTabularData(prev => [...prev, {}]);
  };

  const removeTableRow = (index: number) => {
    if (tabularData.length <= 1) return;
    setTabularData(prev => prev.filter((_, i) => i !== index));
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
      const mappedData = mapSpreadsheetToInputSchema(data, inputSchema);
      
      if (mappedData.length === 0) {
        throw new Error('No valid data found in the file');
      }

      if (!multiInput && mappedData.length > 0) {
        // In single input mode, just use the first row
        setInputValues(mappedData[0]);
        toast({
          title: "Data imported",
          description: `Imported the first row from ${file.name}`,
        });
      } else {
        // In tabular mode, use all rows
        setTabularData(mappedData);
        
        // Switch to tabular mode if we're not already there
        if (!multiInput) {
          await updateMultiInput(true);
        }
        
        toast({
          title: "Data imported",
          description: `Imported ${mappedData.length} rows from ${file.name}`,
        });
      }
      
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

  const renderTabularInputs = () => {
    return (
      <div className="overflow-x-auto">
        <UITable>
          <TableHeader>
            <TableRow>
              {inputSchema.map((field) => (
                <TableHead key={field.field_name} className="capitalize">
                  <div className="flex items-center gap-1.5">
                    <InputFieldIcon type={field.type} className="text-muted-foreground" />
                    <span>{formatFieldName(field.field_name)}</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabularData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {inputSchema.map((field) => (
                  <TableCell key={`${rowIndex}-${field.field_name}`}>
                    <TypedInputField
                      field={field}
                      value={row[field.field_name] !== undefined ? row[field.field_name] : 
                        (field.type === 'string' || field.type === 'person' || field.type === 'email' || 
                         field.type === 'phone' || field.type === 'address' || field.type === 'url' || 
                         field.type === 'zip_code' || field.type === 'state' || field.type === 'country' ||
                         field.type === 'date') ? '' : 
                        (field.type === 'number' || field.type === 'integer' || 
                         field.type === 'currency' || field.type === 'percentage' || 
                         field.type === 'year') ? 0 : false
                      }
                      onChange={(name, value) => handleTabularInputChange(rowIndex, name, value)}
                      showValidation={false} // Disable validation messages in table view to save space
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <button 
                    onClick={() => removeTableRow(rowIndex)}
                    className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    disabled={tabularData.length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </UITable>
        
        <button 
          onClick={addTableRow}
          className="mt-2 text-sm flex items-center gap-1 text-primary hover:underline"
        >
          <Plus className="h-4 w-4" /> Add Row
        </button>
      </div>
    );
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
            className="mr-2"
          >
            <Upload className="h-4 w-4 mr-1" />
            <span>Import</span>
          </Button>
          <Label htmlFor="input-mode" className="text-sm">
            {multiInput ? <Table className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Label>
          <Switch
            id="input-mode"
            checked={multiInput}
            onCheckedChange={toggleInputMode}
            disabled={isSaving}
          />
          <span className="text-sm">
            {multiInput ? 'Tabular' : 'Single'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4 mb-4">
        {multiInput ? (
          renderTabularInputs()
        ) : (
          inputSchema.map((field) => (
            <div key={field.field_name} className="space-y-2">
              <Label htmlFor={field.field_name} className="flex items-center gap-1.5 capitalize">
                <InputFieldIcon type={field.type} className="text-muted-foreground" />
                <span>{formatFieldName(field.field_name)}</span>
              </Label>
              <TypedInputField
                field={field}
                value={inputValues[field.field_name]}
                onChange={handleInputChange}
              />
            </div>
          ))
        )}
      </div>
      
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
