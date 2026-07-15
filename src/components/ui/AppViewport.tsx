import React from 'react';

export function AppViewport({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      position: 'relative',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {children}
    </div>
  );
}
