import { Person } from '../types';

interface NodeActionPanelProps {
  person: Person;
  nodePosition?: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function NodeActionPanel({
  person,
  nodePosition,
  onClose,
  onEdit,
  onDelete,
}: NodeActionPanelProps) {
  const displayName = person.alias || person.name;

  const handleDelete = () => {
    if (confirm(`Delete ${displayName}?`)) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute top-20 right-6 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[200px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-medium text-gray-900 text-sm">{displayName}</div>
            {person.relationLabel && (
              <div className="text-xs text-gray-500 mt-1">{person.relationLabel}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

