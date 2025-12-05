import React, { useState, useEffect } from 'react';
import { WorkshopStep } from '../types';

interface SidebarProps {
  steps: WorkshopStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

// Tree structure for rendering
interface StepNode {
  step: WorkshopStep;
  index: number;
  children: StepNode[];
}

export const Sidebar: React.FC<SidebarProps> = ({ steps, currentStepIndex, onSelectStep }) => {
  // State for expanded parent nodes (keyed by step ID or index)
  // Using index as key for simplicity since IDs might not be unique globally across sections
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  // Auto-expand the parent of the current active step
  useEffect(() => {
    // Find the parent of the current step index
    // We need to reconstruct the tree logic to find the parent.
    // Or we can just do a linear scan backwards to find the level 0 item.
    if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
      const traverseBack = () => {
        let i = currentStepIndex;
        while (i >= 0) {
          if (steps[i].level === 0) {
            setExpandedNodes(prev => ({ ...prev, [i]: true }));
            break;
          }
          i--;
        }
      };
      traverseBack();
    }
  }, [currentStepIndex, steps]);


  // Group steps by section first
  const groupedSteps = steps.reduce((acc, step, index) => {
    if (!acc[step.section]) {
      acc[step.section] = [];
    }
    acc[step.section].push({ step, index, children: [] });
    return acc;
  }, {} as Record<string, StepNode[]>);

  // Build trees within each section
  const buildTrees = (nodes: StepNode[]): StepNode[] => {
    const roots: StepNode[] = [];
    let currentRoot: StepNode | null = null;

    nodes.forEach(node => {
      if (node.step.level === 0 || node.step.level === undefined) {
        currentRoot = { ...node, children: [] };
        roots.push(currentRoot);
      } else if (node.step.level === 1 && currentRoot) {
        currentRoot.children.push(node);
      } else {
        // Fallback for orphans or deeper levels (treat as root to show them at least)
        roots.push({ ...node, children: [] });
        currentRoot = null;
      }
    });
    return roots;
  };

  const toggleExpand = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <aside className="w-72 h-screen bg-langflow-sidebar border-r border-white/5 flex flex-col shrink-0 flex-none">
      {/* Brand */}
      <div className="p-6 flex items-center gap-4 shrink-0">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg"
          alt="IBM"
          className="h-8 w-auto brightness-0 invert opacity-90"
        />
        <div className="h-8 w-px bg-white/10"></div>
        <div>
          <h1 className="font-bold text-gray-100 tracking-tight text-sm leading-tight">Watsonx.data Workshop</h1>
        </div>
      </div>

      {/* Steps List */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {Object.entries(groupedSteps).map(([sectionName, genericNodes]) => {
          const treeRoots = buildTrees(genericNodes as StepNode[]);

          return (
            <div key={sectionName} className="space-y-2">
              <h3 className="px-2 text-xs font-bold text-gray-500 uppercase tracking-widest sticky top-0 bg-langflow-sidebar z-10 py-1">
                {sectionName}
              </h3>
              <div className="space-y-0.5">
                {treeRoots.map((rootNode) => {
                  const isActive = rootNode.index === currentStepIndex;
                  const isCompleted = rootNode.index < currentStepIndex;
                  const hasChildren = rootNode.children.length > 0;
                  const isExpanded = expandedNodes[rootNode.index];
                  // If active is a child, parent is also "active context"
                  const isChildActive = rootNode.children.some(c => c.index === currentStepIndex);

                  return (
                    <div key={rootNode.index} className="space-y-0.5">
                      {/* Parent Node */}
                      <div
                        onClick={() => onSelectStep(rootNode.index)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all group cursor-pointer ${isActive
                          ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          }`}
                      >
                        {/* Status Icon */}
                        <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-mono border ${isActive || isChildActive
                          ? 'border-langflow-primary text-langflow-primary bg-langflow-primary/10'
                          : isCompleted // Check if parent is completed (only if all children done? or just index passed?) - index passed is simplest
                            ? 'border-green-500/50 text-green-500 bg-green-500/10'
                            : 'border-gray-700 text-gray-600'
                          }`}>
                          {isCompleted && !isActive ? '✓' : rootNode.index + 1}
                        </div>

                        <span className={`text-sm font-medium truncate flex-1 ${isActive ? 'text-white' : ''}`}>
                          {rootNode.step.title}
                        </span>

                        {hasChildren && (
                          <button
                            onClick={(e) => toggleExpand(rootNode.index, e)}
                            className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                          >
                            <svg
                              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Children Nodes */}
                      {hasChildren && isExpanded && (
                        <div className="ml-4 pl-4 border-l border-white/5 space-y-0.5 mt-0.5">
                          {rootNode.children.map(child => {
                            const isChildItemActive = child.index === currentStepIndex;
                            const isChildCompleted = child.index < currentStepIndex;
                            return (
                              <button
                                key={child.index}
                                onClick={() => onSelectStep(child.index)}
                                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-all group ${isChildItemActive
                                  ? 'bg-white/5 text-white'
                                  : 'text-gray-400 hover:text-gray-200'
                                  }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${isChildItemActive ? 'bg-langflow-primary' : isChildCompleted ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                <span className={`text-sm truncate ${isChildItemActive ? 'text-white' : ''}`}>
                                  {child.step.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5 shrink-0">
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