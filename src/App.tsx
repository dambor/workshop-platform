import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import WorkshopView from './components/WorkshopView';
import { ThemeProvider } from './theme/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-surface text-fg transition-colors duration-300">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/:workshopId" element={<WorkshopView />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
