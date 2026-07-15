import React from 'react';

export function SurfaceCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`surface-card ${className}`} style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-md)',
      width: '100%'
    }}>
      {children}
    </div>
  );
}
