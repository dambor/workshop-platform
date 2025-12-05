import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentArea } from './components/ContentArea';
import { ChatWidget } from './components/ChatWidget';
import { parseWorkshopMarkdown } from './utils/markdownParser';
import { WorkshopStep } from './types';

import workshopContent from './workshop.md?raw';

const App: React.FC = () => {
  // Parse content synchronously
  const [steps] = useState<WorkshopStep[]>(() => parseWorkshopMarkdown(workshopContent));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // No loading state needed anymore


  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };



  if (steps.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-langflow-bg text-red-400">
        Error: No content found.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-langflow-bg text-gray-200">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-gray-800 rounded-md border border-white/10"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      {/* Sidebar Wrapper for Mobile */}
      <div className={`fixed inset-0 z-40 lg:static lg:block transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <div className="flex h-full">
          <Sidebar
            steps={steps}
            currentStepIndex={currentStepIndex}
            onSelectStep={(idx) => {
              setCurrentStepIndex(idx);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
          />
          {/* Overlay for mobile */}
          <div
            className="flex-1 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        </div>
      </div>

      <ContentArea
        step={currentStep}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={currentStepIndex === 0}
        isLast={currentStepIndex === steps.length - 1}
      />

      <ChatWidget />
    </div>
  );
};

export default App;