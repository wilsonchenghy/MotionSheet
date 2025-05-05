import { X, Loader2 } from "lucide-react";

interface AddColumnModalProps {
  newColumnName: string;
  setNewColumnName: (name: string) => void;
  handleAddColumn: () => void;
  closeModal: () => void;
  isLoading: boolean;
}

const AddColumnModal = ({newColumnName, setNewColumnName, handleAddColumn, closeModal, isLoading}: AddColumnModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add New Column</h3>
          <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-500"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="columnName" className="block text-sm font-medium text-gray-700 mb-2">
            Column Name
          </label>
          <input
            type="text"
            id="columnName"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleAddColumn}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 

export default AddColumnModal;