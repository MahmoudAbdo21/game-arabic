'use client';

import React, { useState } from 'react';

export function PrimaryButton({ children, onClick, fullWidth = false }: { children: React.ReactNode, onClick?: () => void, fullWidth?: boolean }) {
  return (
    <button onClick={onClick} style={{
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: 'var(--radius-full)',
      fontWeight: 700,
      fontSize: '18px',
      width: fullWidth ? '100%' : 'auto',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, fullWidth = false }: { children: React.ReactNode, onClick?: () => void, fullWidth?: boolean }) {
  return (
    <button onClick={onClick} style={{
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      padding: '16px 24px',
      borderRadius: 'var(--radius-full)',
      fontWeight: 600,
      fontSize: '16px',
      border: '2px solid var(--color-border)',
      width: fullWidth ? '100%' : 'auto',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}>
      {children}
    </button>
  );
}

export function SoundStateButton() {
  const [isOn, setIsOn] = useState(true);

  return (
    <button onClick={() => setIsOn(!isOn)} style={{
      backgroundColor: isOn ? 'var(--color-primary)' : 'var(--color-border)',
      color: isOn ? 'white' : 'var(--color-text-secondary)',
      padding: '12px',
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    }} aria-label="Toggle Sound">
      {isOn ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
      )}
    </button>
  );
}
