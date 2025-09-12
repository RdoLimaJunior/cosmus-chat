import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from '../contexts/TutorialContext';

const Tutorial: React.FC = () => {
  const { isTutorialActive, activeTutorial, currentStepIndex, goToNextStep, goToPrevStep, endTutorial } = useTutorial();
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentStep = activeTutorial?.steps[currentStepIndex];

  useEffect(() => {
    if (!isTutorialActive || !currentStep) return;

    const calculatePosition = () => {
      const targetElement = document.querySelector(currentStep.target) as HTMLElement;
      if (!targetElement) {
        // Se o elemento não for encontrado, talvez pular o passo ou terminar o tutorial
        console.warn(`Elemento do tutorial não encontrado: ${currentStep.target}`);
        endTutorial();
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const popoverRect = popoverRef.current?.getBoundingClientRect();

      // Estilo para o destaque
      setHighlightStyle({
        width: `${targetRect.width + 10}px`,
        height: `${targetRect.height + 10}px`,
        top: `${targetRect.top - 5}px`,
        left: `${targetRect.left - 5}px`,
      });

      // FIX: Refactored popover position calculation to use numbers for logic and prevent incorrect type casting.
      // Calculations are performed on numbers, and then converted to string values for the CSS properties.
      // Estilo para o popover
      const popoverHeight = popoverRect?.height || 200;
      const popoverWidth = popoverRect?.width || 300;
      const margin = 15;
      
      let top = 0;
      let left = 0;

      switch (currentStep.placement) {
        case 'bottom':
          top = targetRect.bottom + margin;
          left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
          break;
        case 'top':
          top = targetRect.top - popoverHeight - margin;
          left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
          left = targetRect.left - popoverWidth - margin;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
          left = targetRect.right + margin;
          break;
      }

      // Previne que o popover saia da tela
      if (left < margin) left = margin;
      if (top < margin) top = margin;
      if ((left + popoverWidth) > window.innerWidth - margin) {
        left = window.innerWidth - popoverWidth - margin;
      }
       if ((top + popoverHeight) > window.innerHeight - margin) {
        top = window.innerHeight - popoverHeight - margin;
      }

      setPopoverStyle({
        top: `${top}px`,
        left: `${left}px`,
      });
    };
    
    // Calcula na montagem e recalcula no redimensionamento
    calculatePosition();
    window.addEventListener('resize', calculatePosition);

    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [currentStep, isTutorialActive, endTutorial]);

  if (!isTutorialActive || !currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeTutorial.steps.length - 1;

  return (
    <>
      <div className="tutorial-highlight" style={highlightStyle} />
      <div ref={popoverRef} className="tutorial-popover spaceship-panel" style={popoverStyle}>
        <h3 className="text-lg font-bold text-[var(--color-accent)] mb-2">{currentStep.title}</h3>
        <p className="text-sm text-[var(--color-text-base)] mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <button onClick={endTutorial} className="text-xs text-[var(--color-text-muted)] hover:underline">Pular</button>
          <div className="flex gap-2">
            {!isFirstStep && (
              <button onClick={goToPrevStep} className="spaceship-button text-xs px-3 py-1">Anterior</button>
            )}
            <button onClick={isLastStep ? endTutorial : goToNextStep} className="spaceship-button text-xs px-3 py-1">
              {isLastStep ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tutorial;
