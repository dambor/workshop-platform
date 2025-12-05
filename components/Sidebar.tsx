import React from 'react';
import { WorkshopStep } from '../types';

interface SidebarProps {
  steps: WorkshopStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ steps, currentStepIndex, onSelectStep }) => {
  // Group steps by section to create the visual hierarchy
  const groupedSteps = steps.reduce((acc, step) => {
    if (!acc[step.section]) {
      acc[step.section] = [];
    }
    acc[step.section].push(step);
    return acc;
  }, {} as Record<string, WorkshopStep[]>);

  // Helper to map local section step to global index
  let globalStepCounter = 0;

  return (
    <aside className="w-72 h-screen bg-langflow-sidebar border-r border-white/5 flex flex-col shrink-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-4">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg"
          alt="IBM"
          className="h-8 w-auto brightness-0 invert opacity-90"
        />
        <div className="h-8 w-px bg-white/10"></div>
        <div>
          <h1 className="font-bold text-gray-100 tracking-tight text-sm leading-tight">Watsonx.data Workshop</h1>
          {/*  <p className="text-[10px] text-gray-500 uppercase tracking-wider">AstraDB & Langflow</p> */}
        </div>
      </div>

      {/* Steps List */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {Object.entries(groupedSteps).map(([sectionName, sectionSteps]) => (
          <div key={sectionName} className="space-y-2">
            <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              {sectionName}
            </h3>
            <div className="space-y-0.5">
              {(sectionSteps as WorkshopStep[]).map((step) => {
                const stepIndex = globalStepCounter++;
                const isActive = stepIndex === currentStepIndex;
                const isCompleted = stepIndex < currentStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => onSelectStep(stepIndex)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all group ${isActive
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                  >
                    <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-mono border ${isActive
                      ? 'border-langflow-primary text-langflow-primary bg-langflow-primary/10'
                      : isCompleted
                        ? 'border-green-500/50 text-green-500 bg-green-500/10'
                        : 'border-gray-700 text-gray-600'
                      }`}>
                      {isCompleted ? '✓' : stepIndex + 1}
                    </div>
                    <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : ''}`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 border border-white/5">
          <p className="text-xs text-gray-400 mb-2">Workshop Progress</p>
          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-langflow-primary h-full transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-right text-xs text-gray-500 mt-1">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
          </p>
        </div>
      </div>
    </aside>
  );
};