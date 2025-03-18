
import { useState, useEffect } from "react";
import { Plus, Trash, Table, List } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InputField, InputValues } from "@/types";
import { useSelectedChatSettings } from "@/hooks/useSelectedChatSettings";
import { TypedInputField, InputFieldIcon } from "@/components/InputField";
import { 
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface WorkflowInputsProps {
  chatId?: string;
  onInputValuesChange?: (values: InputValues | InputValues[]) => void;
  showRunButton?: boolean;
  onRunWorkflow?: () => void;
}

export const WorkflowInputs = ({ 
  chatId,
  onInputValuesChange,
  showRunButton = true,
  onRunWorkflow
}: WorkflowInputsProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [tabularData, setTabularData] = useState<InputValues[]>([{}]);
  
  // Use our hook instead of the direct Supabase queries
  const { 
    multiInput, 
    inputSchema, 
    isLoading, 
    isSaving, 
    updateMultiInput 
  } = useSelectedChatSettings(chatId);

  useEffect(() => {
    // Initialize inputValues and tabularData when inputSchema changes
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
    // Notify parent component of input values changes
    if (onInputValuesChange) {
      onInputValuesChange(multiInput ? tabularData : inputValues);
    }
  }, [inputValues, tabularData, multiInput, onInputValuesChange]);

  const toggleInputMode = async () => {
    await updateMultiInput(!multiInput);
  };

  const handleRunWorkflow = () => {
    if (!onRunWorkflow) return;
    
    setIsRunning(true);
    
    window.postMessage({ 
      type: "CREATE_AGENT_RUN_WINDOW",
      inputs: multiInput ? tabularData : inputValues 
    }, "*");
    
    setTimeout(() => {
      onRunWorkflow();
      setIsRunning(false);
    }, 2000);
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
                    <span>{field.field_name}</span>
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
                <span>{field.field_name}</span>
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
      
      {showRunButton && onRunWorkflow && (
        <button
          onClick={handleRunWorkflow}
          disabled={isRunning}
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
    </div>
  );
};

export default WorkflowInputs;
