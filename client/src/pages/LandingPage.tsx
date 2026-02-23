import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateFamily = async () => {
    setLoading(true);
    try {
      const { token } = await apiClient.createFamily();
      navigate(`/family/${token}`);
    } catch (error) {
      console.error('Failed to create family:', error);
      alert('Failed to create family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-amber-50/50">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 bg-clip-text text-transparent tracking-tight">
          Family Tree
        </h1>
        <p className="text-amber-800 text-xl font-medium">
          Create and share your family tree
        </p>
        <button
          onClick={handleCreateFamily}
          disabled={loading}
          className="px-10 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-semibold text-lg"
        >
          {loading ? 'Creating...' : 'Create New Family'}
        </button>
      </div>
    </div>
  );
}

