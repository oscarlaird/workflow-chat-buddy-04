
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { InputValues, InputField } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a field name by replacing underscores with spaces and capitalizing each word
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Parses CSV content and converts it to an array of InputValues objects
 */
export async function parseSpreadsheetFile(file: File): Promise<InputValues[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        if (!csvContent) {
          throw new Error("Failed to read file");
        }
        
        // Split the content into rows
        const rows = csvContent.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) {
          throw new Error("File must contain a header row and at least one data row");
        }
        
        // Parse the header row
        const headers = rows[0].split(',').map(header => header.trim());
        
        // Parse the data rows
        const result: InputValues[] = [];
        for (let i = 1; i < rows.length; i++) {
          const rowValues = rows[i].split(',').map(value => value.trim());
          if (rowValues.length === headers.length) {
            const rowData: InputValues = {};
            headers.forEach((header, index) => {
              // Convert values to appropriate types
              const value = rowValues[index];
              if (value === 'true' || value === 'false') {
                rowData[header] = value === 'true';
              } else if (!isNaN(Number(value)) && value !== '') {
                rowData[header] = Number(value);
              } else {
                rowData[header] = value;
              }
            });
            result.push(rowData);
          }
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Maps spreadsheet column headers to input schema fields
 */
export function mapSpreadsheetToInputSchema(
  data: InputValues[], 
  inputSchema: InputField[]
): InputValues[] {
  if (data.length === 0) return [];
  
  const result: InputValues[] = [];
  const schemaFieldNames = inputSchema.map(field => field.field_name);
  
  data.forEach(row => {
    const mappedRow: InputValues = {};
    
    // Initialize with default values
    inputSchema.forEach(field => {
      if (field.type === 'string' || field.type === 'person' || field.type === 'email' || 
          field.type === 'phone' || field.type === 'address' || field.type === 'url' || 
          field.type === 'zip_code' || field.type === 'state' || field.type === 'country' ||
          field.type === 'date') {
        mappedRow[field.field_name] = '';
      } else if (field.type === 'number' || field.type === 'integer' || 
                field.type === 'currency' || field.type === 'percentage' || 
                field.type === 'year') {
        mappedRow[field.field_name] = 0;
      } else if (field.type === 'bool') {
        mappedRow[field.field_name] = false;
      }
    });
    
    // Map input data to schema fields
    Object.keys(row).forEach(key => {
      // Try exact match
      if (schemaFieldNames.includes(key)) {
        mappedRow[key] = row[key];
      } else {
        // Try case-insensitive match or normalized match (spaces to underscores)
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');
        const matchedField = schemaFieldNames.find(
          field => field.toLowerCase() === normalizedKey || 
                  field.toLowerCase() === key.toLowerCase()
        );
        
        if (matchedField) {
          mappedRow[matchedField] = row[key];
        }
      }
    });
    
    result.push(mappedRow);
  });
  
  return result;
}
