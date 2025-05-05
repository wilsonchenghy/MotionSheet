import Spreadsheet from "react-spreadsheet";

interface SpreadsheetGridProps {
  data: any[][];
  headers: string[];
  handleSelect: (selected: any) => void;
  handleChange: (newData: any[][]) => void;
}

const SpreadsheetGrid = ({data, headers, handleSelect, handleChange}: SpreadsheetGridProps) => {
  return (
    <div className="flex-1 overflow-auto">
      <div>
        <Spreadsheet 
          data={data}
          columnLabels={headers}
          className="!block p-0.5"
          onSelect={handleSelect}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default SpreadsheetGrid;