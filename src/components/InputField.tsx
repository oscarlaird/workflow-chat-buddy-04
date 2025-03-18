import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, formatFieldName } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputField as InputFieldType } from "@/types";
import { validateInput, ValidationResult } from "@/utils/inputValidation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Link,
  DollarSign,
  Percent,
  Map,
  Calendar as CalendarIcon,
  Hash,
  Globe,
  Home,
  Check,
  X,
  ChevronUp,
  ChevronDown
} from "lucide-react";

const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
  "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
  "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const countries = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", 
  "China", "India", "Brazil", "Mexico", "Spain", "Italy", "Netherlands", "Sweden",
  "Switzerland", "Norway", "Denmark", "Finland", "Belgium", "Austria", "Portugal",
  "Greece", "Ireland", "New Zealand", "Singapore", "South Korea", "Russia", "South Africa"
];

interface TypedInputFieldProps {
  field: InputFieldType;
  value: any;
  onChange: (name: string, value: any) => void;
  showValidation?: boolean;
}

export const InputFieldIcon: React.FC<{ type: InputFieldType['type'], className?: string }> = ({ type, className }) => {
  const iconProps = { className: cn("h-4 w-4", className) };
  
  switch (type) {
    case 'person':
      return <User {...iconProps} />;
    case 'email':
      return <Mail {...iconProps} />;
    case 'phone':
      return <Phone {...iconProps} />;
    case 'address':
      return <Home {...iconProps} />;
    case 'url':
      return <Link {...iconProps} />;
    case 'currency':
      return <DollarSign {...iconProps} />;
    case 'percentage':
      return <Percent {...iconProps} />;
    case 'zip_code':
      return <Map {...iconProps} />;
    case 'date':
    case 'year':
      return <CalendarIcon {...iconProps} />;
    case 'state':
      return <MapPin {...iconProps} />;
    case 'country':
      return <Globe {...iconProps} />;
    case 'number':
    case 'integer':
      return <Hash {...iconProps} />;
    default:
      return null;
  }
};

export const TypedInputField: React.FC<TypedInputFieldProps> = ({ 
  field, 
  value, 
  onChange,
  showValidation = true 
}) => {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [isTouched, setIsTouched] = useState(false);
  
  const handleValidation = (newValue: any) => {
    if (showValidation) {
      const result = validateInput(newValue, field.type);
      setValidation(result);
    }
  };

  const handleChange = (newValue: any) => {
    onChange(field.field_name, newValue);
    handleValidation(newValue);
    setIsTouched(true);
  };

  const showError = isTouched && !validation.isValid;

  switch (field.type) {
    case 'bool':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.field_name}
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleChange(!!checked)}
          />
          <span className="text-sm text-gray-500">
            {value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
          </span>
        </div>
      );

    case 'date':
      return (
        <div className="w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleChange(date ? date.toISOString().split('T')[0] : '')}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      );

    case 'state':
      return (
        <Select 
          value={String(value)} 
          onValueChange={handleChange}
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

    case 'country':
      return (
        <Select 
          value={String(value)} 
          onValueChange={handleChange}
        >
          <SelectTrigger id={field.field_name} className="w-full">
            <SelectValue placeholder={`Select ${field.field_name}`} />
          </SelectTrigger>
          <SelectContent>
            {countries.map((countryName) => (
              <SelectItem key={countryName} value={countryName}>
                {countryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'year':
      const currentYear = new Date().getFullYear();
      const [yearValue, setYearValue] = useState<number | ''>(value ? parseInt(value) : '');
      
      const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value === '' ? '' : parseInt(e.target.value);
        setYearValue(inputValue);
        if (inputValue !== '') {
          handleChange(inputValue);
        }
      };
      
      const handleYearBlur = () => {
        if (yearValue === '') {
          setYearValue(currentYear);
          handleChange(currentYear);
        }
        handleValidation(yearValue);
      };
      
      return (
        <div className="w-full relative">
          <Input
            id={field.field_name}
            type="number"
            min={1900}
            max={currentYear + 100}
            placeholder={`Enter ${formatFieldName(field.field_name)}`}
            value={yearValue}
            onChange={handleYearInputChange}
            onBlur={handleYearBlur}
            className={cn(showError && "border-red-500")}
          />
          {showError && (
            <p className="text-xs text-red-500 mt-1">{validation.message}</p>
          )}
        </div>
      );

    case 'number':
    case 'integer':
      return (
        <div className="w-full relative">
          <Input
            id={field.field_name}
            type="number"
            placeholder={`Enter ${formatFieldName(field.field_name)}`}
            value={value || ''}
            onChange={(e) => handleChange(field.type === 'integer' ? parseInt(e.target.value) || '' : parseFloat(e.target.value) || '')}
            onBlur={() => handleValidation(value)}
            className={cn(showError && "border-red-500")}
          />
          {showError && (
            <p className="text-xs text-red-500 mt-1">{validation.message}</p>
          )}
        </div>
      );

    case 'currency':
      return (
        <div className="w-full relative">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <DollarSign className="h-4 w-4 text-gray-500" />
            </span>
            <Input
              id={field.field_name}
              type="text"
              placeholder="0.00"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={() => handleValidation(value)}
              className={cn("pl-8", showError && "border-red-500")}
            />
          </div>
          {showError && (
            <p className="text-xs text-red-500 mt-1">{validation.message}</p>
          )}
        </div>
      );

    case 'percentage':
      return (
        <div className="w-full relative">
          <div className="relative">
            <Input
              id={field.field_name}
              type="number"
              min={0}
              max={100}
              step="0.01"
              placeholder="0.00"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={() => handleValidation(value)}
              className={cn("pr-8", showError && "border-red-500")}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Percent className="h-4 w-4 text-gray-500" />
            </span>
          </div>
          {showError && (
            <p className="text-xs text-red-500 mt-1">{validation.message}</p>
          )}
        </div>
      );

    case 'email':
    case 'phone':
    case 'zip_code':
    case 'url':
    case 'person':
    case 'address':
    case 'string':
    default:
      return (
        <div className="w-full relative">
          <Input
            id={field.field_name}
            type="text"
            placeholder={`Enter ${formatFieldName(field.field_name)}`}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => handleValidation(value)}
            className={cn(showError && "border-red-500")}
          />
          {showError && (
            <p className="text-xs text-red-500 mt-1">{validation.message}</p>
          )}
        </div>
      );
  }
};
