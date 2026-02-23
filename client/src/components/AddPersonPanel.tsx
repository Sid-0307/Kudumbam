import { useState, useEffect } from 'react';
import { Person } from '../types';

interface AddPersonPanelProps {
  person?: Person;
  onClose: () => void;
  onSave: (data: {
    name?: string;
    alias?: string;
    age?: number;
    gender?: 'M' | 'F';
    photo_url?: string;
  }) => void;
  onDelete?: () => void;
}

export default function AddPersonPanel({
  person,
  onClose,
  onSave,
  onDelete,
}: AddPersonPanelProps) {
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (person) {
      setName(person.name);
      setAlias(person.alias || '');
      setAge(person.age);
      setGender(person.gender || '');
      setPhotoUrl(person.photo_url || '');
    }
  }, [person]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person && !name.trim()) {
      alert('Name is required');
      return;
    }

    onSave({
      name: name.trim() || undefined,
      alias: alias.trim() || undefined,
      age: age,
      gender: gender || undefined,
      photo_url: photoUrl.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border border-slate-200">
        <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            {person ? 'Edit Person' : 'Add Person'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!person}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alias
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender('M')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  gender === 'M'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'bg-amber-50 text-amber-700 border-2 border-amber-300 hover:border-amber-400'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('F')}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  gender === 'F'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                    : 'bg-amber-50 text-amber-700 border-2 border-amber-300 hover:border-amber-400'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={age || ''}
              onChange={(e) =>
                setAge(e.target.value ? parseInt(e.target.value) : undefined)
              }
              min="0"
              className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              {person ? 'Update' : 'Create'}
            </button>
            {person && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                Delete
              </button>
            )}
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

