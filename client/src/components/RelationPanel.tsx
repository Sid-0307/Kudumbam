import { useState } from 'react';
import { Person } from '../types';

interface RelationPanelProps {
  personA: string;
  personB: string;
  persons: Person[];
  onClose: () => void;
  onSave: (personA: string, personB: string, relationType: 'parent' | 'spouse') => void;
}

export default function RelationPanel({
  personA,
  personB,
  persons,
  onClose,
  onSave,
}: RelationPanelProps) {
  const [relationType, setRelationType] = useState<'parent' | 'spouse'>('parent');
  const [direction, setDirection] = useState<'AtoB' | 'BtoA'>('AtoB');

  const personAObj = persons.find((p) => p.id === personA);
  const personBObj = persons.find((p) => p.id === personB);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPersonA = direction === 'AtoB' ? personA : personB;
    const finalPersonB = direction === 'AtoB' ? personB : personA;
    onSave(finalPersonA, finalPersonB, relationType);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border border-slate-200">
        <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Add Relationship</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">
              {personAObj?.alias || personAObj?.name} ↔ {personBObj?.alias || personBObj?.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relation Type
            </label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value as 'parent' | 'spouse')}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            >
              <option value="parent">Parent</option>
              <option value="spouse">Spouse</option>
            </select>
          </div>

          {relationType === 'parent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'AtoB' | 'BtoA')}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              >
                <option value="AtoB">
                  {personAObj?.alias || personAObj?.name} is parent of{' '}
                  {personBObj?.alias || personBObj?.name}
                </option>
                <option value="BtoA">
                  {personBObj?.alias || personBObj?.name} is parent of{' '}
                  {personAObj?.alias || personAObj?.name}
                </option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

