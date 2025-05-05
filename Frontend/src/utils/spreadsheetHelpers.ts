import axios from 'axios';

// Helper types
export type CellData = { value: string };
export type SpreadsheetData = CellData[][];
export type CellSelection = any;

// Helper for calling API to autocomplete cell
export const autocompleteCell = async (rowData: Record<string, any>, targetColumnName: string): Promise<CellData> => {
  try {
    const response = await axios.post('http://localhost:5001/api/autocomplete', JSON.stringify(rowData), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.status === 'success') {
      const newValue = response.data.output[targetColumnName];
      
      // Use tick or cross to represent true or false
      if (newValue === true || newValue === "true") {
        return { value: "✅" };
      } else if (newValue === false || newValue === "false") {
        return { value: "❌" };
      } 
      return { value: newValue !== undefined ? String(newValue) : "" };
    }
  } catch (error) {
    console.error('Error sending data:', error);
  }
  
  return { value: "" };
};

// Helper for extracting all the data from a row for AI processing
export const extractRowData = (row: CellData[], headers: string[], targetColumnName: string): Record<string, any> => {
  const jsonObject: Record<string, any> = {};
  
  headers.forEach((header, index) => {
    const cellValue = row[index]?.value;
    if (cellValue !== undefined && 
        cellValue !== null && 
        cellValue !== "" && 
        cellValue !== "🟠 Pending...") {
      jsonObject[header] = cellValue;
    }
  });
  
  // For the target column, place a placeholder for the AI to fill in
  jsonObject[targetColumnName] = "<Fill in here>";
  
  return jsonObject;
};

// Helper for checking if the selection is valid
export const isValidSelection = (selection: CellSelection): boolean => {
  return selection && 
    ((selection.range && selection.range.start) || 
     (selection.start) || 
     (selection.constructor && selection.constructor.name === 'RangeSelection2'));
};

// Helper for checking effective selection (current or last valid)
export const getEffectiveSelection = (
  selectedCell: CellSelection,
  lastValidSelection: CellSelection
): CellSelection => {
  return selectedCell && 
         selectedCell.constructor && 
         selectedCell.constructor.name !== 'EmptySelection2' 
         ? selectedCell 
         : lastValidSelection;
};

// Helper functions for getting selected cells' row and column position
export const getSelectedRowColumn = (selection: CellSelection): { row: number, column: number } | null => {
  if (!selection) return null;
  
  // For multiple cells selection
  if (selection.constructor?.name === 'RangeSelection2' && selection.range?.start) {
    return {
      row: selection.range.start.row,
      column: selection.range.start.column
    };
  } 
  // For single cell selection
  else if (selection.start && typeof selection.start.row === 'number') {
    return {
      row: selection.start.row,
      column: selection.start.column
    };
  }
  
  return null;
};

// Helper functions for getting selected cells' row and column position range (From which cell to which cell) (For multiple cells selection)
export const getSelectionRange = (selection: CellSelection): { startRow: number, endRow: number, startCol: number, endCol: number } | null => {
  if (!selection || selection.constructor?.name !== 'RangeSelection2' || !selection.range) return null;
  
  const { start, end } = selection.range;
  if (!start || !end || 
      typeof start.row !== 'number' || typeof start.column !== 'number' ||
      typeof end.row !== 'number' || typeof end.column !== 'number') {
    return null;
  }
  
  return {
    startRow: Math.min(start.row, end.row),
    endRow: Math.max(start.row, end.row),
    startCol: Math.min(start.column, end.column),
    endCol: Math.max(start.column, end.column)
  };
};

// Helper for counting the number of selected cells
export const countSelectedCells = (selection: CellSelection): number => {
  const range = getSelectionRange(selection);
  
  if (range) {
    const { startRow, endRow, startCol, endCol } = range;
    return (endRow - startRow + 1) * (endCol - startCol + 1);
  }
  
  return getSelectedRowColumn(selection) ? 1 : 0;
};

// Helper for autocomplete button
export const updateCellWithAutofill = async (
  newData: SpreadsheetData, 
  row: number, 
  column: number, 
  headers: string[],
  updateDataCallback: (data: SpreadsheetData) => void
): Promise<void> => {
  // Initially set cells to pending status
  if (newData[row] && newData[row][column]) {
    newData[row][column] = { value: "🟠 Pending..." };
  }
  
  updateDataCallback([...newData]);
  
  const jsonObject = extractRowData(newData[row], headers, headers[column]);
  
  try {
    const processedCell = await autocompleteCell(jsonObject, headers[column]);
    
    if (newData[row] && newData[row][column]) {
      newData[row][column] = processedCell;
    }
  } catch (error) {
    console.error('Error sending data:', error);
    // Set cells to empty if there is an error
    if (newData[row] && newData[row][column]) {
      newData[row][column] = { value: "" };
    }
  }
}; 