import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ContentArea } from './ContentArea';
import { ChatWidget } from './ChatWidget';
import { parseWorkshopMarkdown } from '../utils/markdownParser';
import { WorkshopStep } from '../types';

const WorkshopView: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<WorkshopStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    const saved = sessionStorage.getItem(`workshop-step-${workshopId}`);
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkshop = async () => {
      try {
        setLoading(true);

        // Try local path first (works in dev and when served locally)
        const basePath = import.meta.env.BASE_URL || '/';
        const localUrl = `${basePath}workshops/${workshopId}.md`;
        let response = await fetch(localUrl);

        // Fall back to GitHub Raw if local fetch fails
        if (!response.ok) {
          const repoOwner = 'dambor';
          const repoName = 'workshop-platform';
          const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/public/workshops/${workshopId}.md`;
          response = await fetch(rawUrl);
        }

        if (!response.ok) {
          throw new Error('Workshop file not found');
        }

        const content = await response.text();
        const parsedSteps = parseWorkshopMarkdown(content);
        setSteps(parsedSteps);
        // A previously saved step index (sessionStorage) can be out of range if the
        // workshop's step count changed since the last visit. Clamp it so we never
        // index past the end and render an undefined step.
        setCurrentStepIndex(prev => Math.min(Math.max(prev, 0), Math.max(0, parsedSteps.length - 1)));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Workshop not found or failed to load.');
        setLoading(false);
      }
    };

    if (workshopId) {
      loadWorkshop();
    }
  }, [workshopId]);


  useEffect(() => {
    sessionStorage.setItem(`workshop-step-${workshopId}`, String(currentStepIndex));
  }, [currentStepIndex, workshopId]);

  // Guard against an out-of-range index (e.g. stale sessionStorage) so we never
  // pass an undefined step to ContentArea.
  const safeStepIndex = steps.length ? Math.min(Math.max(currentStepIndex, 0), steps.length - 1) : 0;
  const currentStep = steps[safeStepIndex];

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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface text-fg-muted gap-3">
        <div className="w-2 h-2 rounded-full bg-[var(--color-gemini-blue)] animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-[var(--color-gemini-purple)] animate-bounce delay-75" />
        <div className="w-2 h-2 rounded-full bg-[var(--color-gemini-coral)] animate-bounce delay-150" />
        <span className="ml-2 text-sm">Loading workshop…</span>
      </div>
    );
  }

  if (error || steps.length === 0) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-surface text-fg gap-4">
        <div className="text-fg-muted">{error || 'No content found.'}</div>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 gemini-gradient text-white rounded-full font-medium hover:scale-105 active:scale-95 transition-transform"
        >
          Back to Workshops
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface text-fg">
      {/* Mobile Sidebar Toggle */}
      <button
        className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-surface-1 rounded-lg border border-border-default text-fg"
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

export default WorkshopView;
