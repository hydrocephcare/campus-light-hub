import React from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale';
  delay?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  animation = 'fade-up',
  delay = 0,
}) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // Simplified animations for mobile - only fade, no translate to prevent overflow
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const animationClasses = {
    'fade-up': isMobile ? 'opacity-0' : 'translate-y-8 opacity-0',
    'fade-in': 'opacity-0',
    'slide-left': isMobile ? 'opacity-0' : '-translate-x-4 opacity-0',
    'slide-right': isMobile ? 'opacity-0' : 'translate-x-4 opacity-0',
    'scale': 'scale-95 opacity-0',
  };

  const visibleClasses = {
    'fade-up': isMobile ? 'opacity-100' : 'translate-y-0 opacity-100',
    'fade-in': 'opacity-100',
    'slide-left': isMobile ? 'opacity-100' : 'translate-x-0 opacity-100',
    'slide-right': isMobile ? 'opacity-100' : 'translate-x-0 opacity-100',
    'scale': 'scale-100 opacity-100',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out overflow-hidden',
        isVisible ? visibleClasses[animation] : animationClasses[animation],
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
