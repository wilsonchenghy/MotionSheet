import { Plus, Wand2, Loader2, Trash2, X } from "lucide-react";

interface SpreadsheetToolbarProps {
  addRow: () => void;
  addColumn: () => void;
  deleteRow: () => void;
  deleteColumn: () => void;
  clearSelectedCells: () => void;
  handleAutocomplete: () => void;
  isLoading: boolean;
}

const SpreadsheetToolbar = ({addRow, addColumn, deleteRow, deleteColumn, clearSelectedCells, handleAutocomplete, isLoading}: SpreadsheetToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center space-x-3">
        <img src="/logo.png" alt="Logo" className="h-13 w-auto" />
        <div className="flex items-center space-x-3">
          <button 
            onClick={addRow}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-[#D7F4DE] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </button>
          <button 
            onClick={addColumn}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-[#D7F4DE] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Column
          </button>
          <button 
            onClick={deleteRow}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-[#fcdcdb] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Row
          </button>
          <button 
            onClick={deleteColumn}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-[#fcdcdb] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Column
          </button>
          <button 
            onClick={clearSelectedCells}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-400 rounded-md hover:bg-gray-50 transition-colors duration-150"
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Clear Cells
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button 
          onClick={handleAutocomplete}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          {isLoading ? "Processing..." : "Autocomplete"}
        </button>
      </div>
    </div>
  );
} 

export default SpreadsheetToolbar;