import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FamilyWorkspace from './pages/FamilyWorkspace';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/family/:token" element={<FamilyWorkspace />} />
    </Routes>
  );
}

export default App;

