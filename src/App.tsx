import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import WorkshopView from './components/WorkshopView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-gray-200">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:workshopId" element={<WorkshopView />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;