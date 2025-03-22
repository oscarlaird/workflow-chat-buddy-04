
import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";

interface DataTableProps {
  data: any[];
}

const DataTable = ({ data }: DataTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({
    key: null,
    direction: null,
  });

  // Ensure data is an array before proceeding
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">No data available</div>;
  }

  const columns = Object.keys(data[0]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    // Ensure data is an array before trying to sort it
    if (!Array.isArray(data)) {
      console.error('DataTable received non-array data:', data);
      return [];
    }
    
    if (!sortConfig.key || !sortConfig.direction) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (column: string) => {
    if (sortConfig.key !== column) {
      return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
    }
    
    if (sortConfig.direction === 'ascending') {
      return <ChevronUp className="w-4 h-4" />;
    }
    
    if (sortConfig.direction === 'descending') {
      return <ChevronDown className="w-4 h-4" />;
    }
    
    return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
  };

  // Get the sorted data once to ensure it's an array
  const sortedData = getSortedData();
  
  // Final safety check before rendering
  if (!Array.isArray(sortedData)) {
    console.error('getSortedData did not return an array:', sortedData);
    return <div className="text-center p-4 text-gray-500">Error processing data</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column}
                className="p-3 text-left"
              >
                <button
                  onClick={() => requestSort(column)}
                  className="flex items-center gap-1 hover:text-primary dark:hover:text-primary-foreground"
                >
                  {column}
                  {getSortIcon(column)}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell 
                  key={`${rowIndex}-${column}`}
                  className="p-3 text-sm"
                >
                  {typeof row[column] === 'boolean' 
                    ? (row[column] ? '✅' : '❌') 
                    : String(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
