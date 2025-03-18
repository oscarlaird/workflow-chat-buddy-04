
import { useState, useEffect } from "react";
import { Plus, Trash, Table, List } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputField, InputValues } from "@/types";
import { useSelectedChatSettings } from "@/hooks/useSelectedChatSettings";
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

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export const WorkflowInputs = ({ 
  chatId,
  onInputValuesChange,
  showRunButton = true,
  onRunWorkflow
}: WorkflowInputsProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [tabularData, setTabularData] = useState<InputValues[]>([{}]);
  
  // Use our new hook instead of the direct Supabase queries
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
      if (field.type === 'string') initialValues[field.field_name] = '';
      else if (field.type === 'number') initialValues[field.field_name] = 0;
      else if (field.type === 'bool') initialValues[field.field_name] = false;
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

  const renderInputField = (field: InputField, value: any, onChange: (name: string, value: any) => void) => {
    switch(field.type) {
      case 'string':
        if (field.field_name.toLowerCase() === 'state') {
          return (
            <Select 
              key={field.field_name}
              value={value as string} 
              onValueChange={(val) => onChange(field.field_name, val)}
            >
              <SelectTrigger id={field.field_name} className="w-full">
                <SelectValue placeholder={`Select ${field.field_name}`} />
              </SelectTrigger>
              <SelectContent>
                {states.map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>
                    {stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else {
          return (
            <Input
              key={field.field_name}
              id={field.field_name}
              placeholder={`Enter ${field.field_name}`}
              value={value as string}
              onChange={(e) => onChange(field.field_name, e.target.value)}
            />
          );
        }
      case 'number':
        return (
          <Input
            key={field.field_name}
            id={field.field_name}
            type="number"
            placeholder={`Enter ${field.field_name}`}
            value={value as number}
            onChange={(e) => onChange(field.field_name, parseInt(e.target.value) || 0)}
          />
        );
      case 'bool':
        return (
          <div key={field.field_name} className="flex items-center space-x-2">
            <Checkbox
              id={field.field_name}
              checked={value as boolean}
              onCheckedChange={(checked) => onChange(field.field_name, !!checked)}
            />
            <span className="text-sm text-gray-500">
              {value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTabularInputs = () => {
    return (
      <div className="overflow-x-auto">
        <UITable>
          <TableHeader>
            <TableRow>
              {inputSchema.map((field) => (
                <TableHead key={field.field_name} className="capitalize">
                  {field.field_name}
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
                    {renderInputField(
                      field, 
                      row[field.field_name] !== undefined ? row[field.field_name] : 
                        field.type === 'string' ? '' : 
                        field.type === 'number' ? 0 : 
                        field.type === 'bool' ? false : '',
                      (name, value) => handleTabularInputChange(rowIndex, name, value)
                    )}
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
                <span>{field.field_name}</span>
              </Label>
              {renderInputField(field, inputValues[field.field_name], handleInputChange)}
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
