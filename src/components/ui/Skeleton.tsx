import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const base = 'animate-pulse bg-surface-subtle rounded-lg';
  const shape =
    variant === 'circle' ? 'rounded-full' :
    variant === 'text' ? 'rounded h-4' : 'rounded-lg';

  return (
    <div
      className={`${base} ${shape} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};
