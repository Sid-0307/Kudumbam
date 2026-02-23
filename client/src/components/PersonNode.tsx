import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Person } from '../types';

interface PersonNodeData extends Person {
  relationLabel?: string;
  isRoot?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function PersonNode({ data, selected }: NodeProps<PersonNodeData>) {
  const displayName = data.alias || data.name;
  const isHighlighted = selected || data.isRoot;

  return (
    <div className="relative group">
      <div
      className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg border-2 p-4 min-w-[140px] transition-all ${
        isHighlighted
          ? 'border-amber-600 shadow-xl ring-2 ring-amber-200/50 scale-105'
          : 'border-amber-200 hover:border-amber-300 hover:shadow-xl'
      }`}
      >
        {data.photo_url ? (
          <img
            src={data.photo_url}
            alt={displayName}
            className="w-16 h-16 rounded-full mx-auto mb-2 object-cover ring-2 ring-slate-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-amber-800 text-xl font-semibold ring-2 ring-amber-100">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-center">
          <div className="font-semibold text-amber-900 text-sm">{displayName}</div>
          {data.name !== data.alias && (
            <div className="text-xs text-amber-700 mt-1">{data.name}</div>
          )}
          {data.age && (
            <div className="text-xs text-amber-700 mt-1">{data.age} years</div>
          )}
          {data.relationLabel && (
            <div className="text-xs text-amber-700 mt-1 italic font-medium">
              {data.relationLabel}
            </div>
          )}
        </div>
        {/* Parent/child connectors (vertical) */}
        <Handle
          id="parent-target"
          type="target"
          position={Position.Top}
          className="!bg-amber-600 !border-2 !border-white !w-3 !h-3"
        />
        <Handle
          id="parent-source"
          type="source"
          position={Position.Bottom}
          className="!bg-amber-600 !border-2 !border-white !w-3 !h-3"
        />

        {/* Spouse connectors (horizontal) */}
        <Handle
          id="spouse-source"
          type="source"
          position={Position.Left}
          className="!bg-amber-600 !border-2 !border-white !w-3 !h-3"
        />
        <Handle
          id="spouse-target"
          type="target"
          position={Position.Right}
          className="!bg-amber-600 !border-2 !border-white !w-3 !h-3"
        />
      </div>
      
      {/* Edit and Delete Icons - appear when selected */}
      {isHighlighted && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white rounded-lg shadow-lg border border-slate-200 p-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit?.();
            }}
            className="p-1.5 hover:bg-amber-50 rounded text-amber-700 hover:text-amber-800 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${displayName}?`)) {
                data.onDelete?.();
              }
            }}
            className="p-1.5 hover:bg-red-50 rounded text-red-600 hover:text-red-700 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(PersonNode);

