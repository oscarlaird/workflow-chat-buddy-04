
import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

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

  if (!data || data.length === 0) {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {columns.map((column) => (
              <th 
                key={column}
                className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => requestSort(column)}
                  className="flex items-center gap-1 hover:text-primary dark:hover:text-primary-foreground"
                >
                  {column}
                  {getSortIcon(column)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {getSortedData().map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              {columns.map((column) => (
                <td 
                  key={`${rowIndex}-${column}`}
                  className="p-3 text-sm"
                >
                  {typeof row[column] === 'boolean' 
                    ? (row[column] ? '✅' : '❌') 
                    : String(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
