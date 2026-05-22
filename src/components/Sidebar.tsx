import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import { WorkshopStep } from '../types';
import { GeminiLogo } from './GeminiLogo';

interface SidebarProps {
  steps: WorkshopStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

interface StepNode {
  step: WorkshopStep;
  index: number;
  children: StepNode[];
}

export const Sidebar: React.FC<SidebarProps> = ({ steps, currentStepIndex, onSelectStep }) => {
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < steps.length) {
      let i = currentStepIndex;
      while (i >= 0) {
        if (steps[i].level === 0) {
          setExpandedNodes(prev => ({ ...prev, [i]: true }));
          break;
        }
        i--;
      }
    }
  }, [currentStepIndex, steps]);

  const groupedSteps = steps.reduce((acc, step, index) => {
    if (!acc[step.section]) acc[step.section] = [];
    acc[step.section].push({ step, index, children: [] });
    return acc;
  }, {} as Record<string, StepNode[]>);

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

  const progress = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <aside className="w-72 h-screen bg-surface-1 border-r border-border-subtle flex flex-col shrink-0 flex-none">
      {/* Brand */}
      <button
        onClick={() => navigate('/')}
        className="p-5 flex items-center gap-3 shrink-0 hover:bg-surface-2 transition-colors group text-left border-b border-border-subtle"
      >
        <GeminiLogo size={28} animated />
        <div className="flex flex-col leading-tight">
          <span className="font-display font-semibold text-sm tracking-tight gemini-gradient-text">
            Gemini Workshops
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-fg-subtle mt-0.5">
            Workshop mode
          </span>
        </div>
      </button>

      {/* Steps List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {Object.entries(groupedSteps).map(([sectionName, genericNodes]) => {
          const treeRoots = buildTrees(genericNodes as StepNode[]);

          return (
            <div key={sectionName} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-semibold text-fg-subtle uppercase tracking-[0.18em] sticky top-0 bg-surface-1 z-10 py-1.5">
                {sectionName}
              </h3>
              <div className="space-y-0.5">
                {treeRoots.map((rootNode) => {
                  const isActive = rootNode.index === currentStepIndex;
                  const isCompleted = rootNode.index < currentStepIndex;
                  const hasChildren = rootNode.children.length > 0;
                  const isExpanded = expandedNodes[rootNode.index];
                  const isChildActive = rootNode.children.some(c => c.index === currentStepIndex);

                  return (
                    <div key={rootNode.index} className="space-y-0.5">
                      <div
                        onClick={() => onSelectStep(rootNode.index)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all group cursor-pointer ${
                          isActive
                            ? 'bg-accent-soft text-fg'
                            : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                        }`}
                      >
                        {/* Status indicator */}
                        <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-medium border transition-all ${
                          isActive || isChildActive
                            ? 'border-transparent gemini-gradient text-white shadow-sm'
                            : isCompleted
                              ? 'border-transparent bg-[var(--color-gemini-indigo)]/15 text-[var(--color-gemini-indigo)]'
                              : 'border-border-default text-fg-subtle'
                        }`}>
                          {isCompleted && !isActive ? <Check className="w-3 h-3" /> : rootNode.index + 1}
                        </div>

                        <span className={`text-sm font-medium truncate flex-1 ${isActive ? 'text-fg' : ''}`}>
                          {rootNode.step.title}
                        </span>

                        {hasChildren && (
                          <button
                            onClick={(e) => toggleExpand(rootNode.index, e)}
                            className="p-1 hover:bg-border-default rounded text-fg-subtle hover:text-fg transition-colors"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        )}
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="ml-4 pl-4 border-l border-border-subtle space-y-0.5 mt-0.5">
                          {rootNode.children.map(child => {
                            const isChildItemActive = child.index === currentStepIndex;
                            const isChildCompleted = child.index < currentStepIndex;
                            return (
                              <button
                                key={child.index}
                                onClick={() => onSelectStep(child.index)}
                                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all ${
                                  isChildItemActive
                                    ? 'bg-surface-2 text-fg'
                                    : 'text-fg-muted hover:text-fg hover:bg-surface-2/60'
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  isChildItemActive
                                    ? 'bg-[var(--color-gemini-purple)] scale-125'
                                    : isChildCompleted
                                      ? 'bg-[var(--color-gemini-indigo)]'
                                      : 'bg-border-strong'
                                }`}></div>
                                <span className="text-sm truncate">
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

      {/* Progress footer */}
      <div className="p-4 border-t border-border-subtle shrink-0">
        <div className="rounded-2xl p-4 bg-surface-2 border border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-fg-muted">Progress</p>
            <p className="text-xs font-semibold text-fg">{progress}%</p>
          </div>
          <div className="w-full bg-surface-3 h-1.5 rounded-full overflow-hidden">
            <div
              className="gemini-gradient h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-fg-subtle mt-2">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>
      </div>
    </aside>
  );
};
