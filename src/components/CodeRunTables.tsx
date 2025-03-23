
import { ChevronDown, ChevronRight, Table } from "lucide-react";
import DataTable from "@/components/DataTable";

interface CodeRunTablesProps {
  hasTableData: boolean;
  tables: Record<string, any>;
  tablesExpanded: boolean;
  setTablesExpanded: (expanded: boolean) => void;
}

const CodeRunTables = ({
  hasTableData,
  tables,
  tablesExpanded,
  setTablesExpanded
}: CodeRunTablesProps) => {
  if (!hasTableData) return null;
  
  return (
    <div className="mt-3 border-t pt-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setTablesExpanded(!tablesExpanded);
        }}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
      >
        {tablesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Table className="w-4 h-4" />
        <span>Result Tables</span>
      </button>
      
      {tablesExpanded && (
        <div className="space-y-4 mt-2">
          {Object.entries(tables).map(([tableName, tableData], index) => (
            <div key={`table-${index}`} className="border rounded-md overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 font-medium text-sm border-b">
                {tableName}
              </div>
              <div className="p-1">
                <DataTable data={tableData as any[]} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeRunTables;
