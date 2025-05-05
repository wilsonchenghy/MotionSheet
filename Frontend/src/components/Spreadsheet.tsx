import { useState } from "react";
import SpreadsheetToolbar from "./SpreadsheetToolbar";
import SpreadsheetGrid from "./SpreadsheetGrid";
import AddColumnModal from "./AddColumnModal";
import {
  SpreadsheetData,
  CellSelection,
  getSelectedRowColumn,
  getSelectionRange,
  countSelectedCells,
  isValidSelection,
  getEffectiveSelection,
  autocompleteCell,
  extractRowData,
  updateCellWithAutofill
} from "../utils/spreadsheetHelpers";

const SpreadsheetContainer = () => {
  const [headers, setHeaders] = useState(["First Name", "Last Name", "Major"]);
  const [showModal, setShowModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedCell, setSelectedCell] = useState<CellSelection>(null);
  const [lastValidSelection, setLastValidSelection] = useState<CellSelection>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCellCount, setSelectedCellCount] = useState(0);
  
  const students = [
    { id: 1, firstName: "John", lastName: "Doe", major: "Computer Science" },
    { id: 2, firstName: "Jane", lastName: "Smith", major: "Philosophy" },
    { id: 3, firstName: "Alex", lastName: "Johnson", major: "Electrical Engineering" }
  ];

  // Spreadsheet data
  const [data, setData] = useState<SpreadsheetData>([
    ...students.map(student => [
      { value: student.firstName },
      { value: student.lastName },
      { value: student.major }
    ])
  ]);

  // Add row button
  const addRow = () => {
    const newRow = headers.map(() => ({ value: "" }));
    setData([...data, newRow]);
  };

  // Add column button
  const addColumn = () => {
    setNewColumnName(`Column ${headers.length + 1}`);
    setShowModal(true);
  };

  // Autocomplete column
  const autocompleteColumn = async () => {
    if (newColumnName.trim() !== "") {
      setHeaders([...headers, newColumnName]);
      setIsLoading(true);
      
      // Initially set cells to pending status
      const initialData = data.map(row => [...row, { 
        value: "🟠 Pending...", 
      }]);
      setData(initialData);
      
      // Create JSON representation of each row to send to API
      const newData = await Promise.all(initialData.map(async (row, rowIndex) => {
        const jsonObject = extractRowData(row, headers, newColumnName);
        
        try {
          const processedCell = await autocompleteCell(jsonObject, newColumnName);
          
          const updatedRow = [...row];
          updatedRow[updatedRow.length - 1] = processedCell;
          
          return updatedRow;
        } catch (error) {
          console.error('Error sending data:', error);
          // Set cells to empty if there is an error
          const updatedRow = [...row];
          updatedRow[updatedRow.length - 1] = { value: "" };
          return updatedRow;
        }
      }));
      
      setData(newData);
      setShowModal(false);
      setIsLoading(false);
    }
  };

  // Delete row button
  const deleteRow = () => {
    const selectionToUse = getEffectiveSelection(selectedCell, lastValidSelection);
    
    if (!selectionToUse) {
      console.log("No valid cell selection found");
      return;
    }
    
    const selectedPos = getSelectedRowColumn(selectionToUse);
    if (!selectedPos) return;
    
    const rowToDelete = selectedPos.row;
    
    if (rowToDelete >= 0 && rowToDelete < data.length) {
      const newData = data.filter((_, index) => index !== rowToDelete);
      setData(newData);
      if (newData.length === 0 || rowToDelete >= newData.length) {
        setSelectedCell(null);
        setLastValidSelection(null);
      }
    }
  };

  // Delete column button
  const deleteColumn = () => {
    const selectionToUse = getEffectiveSelection(selectedCell, lastValidSelection);
    
    if (!selectionToUse) {
      console.log("No valid cell selection found");
      return;
    }
    
    const selectedPos = getSelectedRowColumn(selectionToUse);
    if (!selectedPos) return;
    
    const colToDelete = selectedPos.column;
    
    if (colToDelete >= 0 && colToDelete < headers.length) {
      const newHeaders = headers.filter((_, index) => index !== colToDelete);
      
      const newData = data.map(row => 
        row.filter((_, index) => index !== colToDelete)
      );
      
      setHeaders(newHeaders);
      setData(newData);
      
      if (newHeaders.length === 0) {
        setSelectedCell(null);
        setLastValidSelection(null);
      }
    }
  };

  // Clear cells button
  const clearSelectedCells = () => {
    const selectionToUse = getEffectiveSelection(selectedCell, lastValidSelection);
    
    if (!selectionToUse) {
      console.log("No valid cell selection found");
      return;
    }
    
    const newData = [...data.map(row => [...row])];
    
    const range = getSelectionRange(selectionToUse);
    if (range) {
      const { startRow, endRow, startCol, endCol } = range;
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          if (row < newData.length && col < newData[row].length) {
            newData[row][col] = { value: "" };
          }
        }
      }
    } else {
      const selectedPos = getSelectedRowColumn(selectionToUse);
      if (selectedPos) {
        const { row, column } = selectedPos;
        
        if (row < newData.length && column < newData[row].length) {
          newData[row][column] = { value: "" };
        }
      }
    }
    
    setData(newData);
  };

  // Autocomplete button
  const handleAutocomplete = async () => {
    const selectionToUse = getEffectiveSelection(selectedCell, lastValidSelection);
    
    if (!selectionToUse) {
      console.log("No valid cell selection found");
      return;
    }
    
    console.log("Autocompleting with selected cell data:", selectionToUse);
    setIsLoading(true);
    
    const newData = [...data];
    
    try {
      const range = getSelectionRange(selectionToUse);
      
      if (range) {
        const { startRow, endRow, startCol, endCol } = range;
        
        const promises = [];
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            promises.push(updateCellWithAutofill(newData, row, col, headers, setData));
          }
        }
        
        await Promise.all(promises);
      } else {
        const selectedPos = getSelectedRowColumn(selectionToUse);
        if (selectedPos) {
          await updateCellWithAutofill(newData, selectedPos.row, selectedPos.column, headers, setData);
        }
      }
      
      setData([...newData]);
    } catch (error) {
      console.error("Error during autocomplete:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cell selection
  const handleSelect = (selected: CellSelection) => {
    console.log(selected);
    setSelectedCell(selected);
    
    if (isValidSelection(selected)) {
      setLastValidSelection(selected);
      setSelectedCellCount(countSelectedCells(selected));
    } else {
      // No cell selected, set count to 0
      setSelectedCellCount(0);
    }
  };

  // Handle cell change
  const handleChange = (newData: SpreadsheetData) => {
    console.log(newData);
    setData(newData);
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg flex flex-col">
      <SpreadsheetToolbar 
        addRow={addRow}
        addColumn={addColumn}
        deleteRow={deleteRow}
        deleteColumn={deleteColumn}
        clearSelectedCells={clearSelectedCells}
        handleAutocomplete={handleAutocomplete}
        isLoading={isLoading}
      />
      
      <SpreadsheetGrid 
        data={data}
        headers={headers}
        handleSelect={handleSelect}
        handleChange={handleChange}
      />

      {showModal && (
        <AddColumnModal
          newColumnName={newColumnName}
          setNewColumnName={setNewColumnName}
          handleAddColumn={autocompleteColumn}
          closeModal={() => setShowModal(false)}
          isLoading={isLoading}
        />
      )}
      
      {/* Bottom Floating Box */}
      <div
        className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-50 ${
          selectedCellCount > 0
            ? 'bg-gray-800 text-white'
            : 'bg-white border border-gray-400 text-gray-800'
        }`}
      >
        {selectedCellCount > 0
          ? `${selectedCellCount} ${selectedCellCount === 1 ? 'cell' : 'cells'} selected`
          : 'Start typing to autocomplete 🖊️✨✨'}
      </div>

    </div>
  );
}

export default SpreadsheetContainer;