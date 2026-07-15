import React from 'react';

export function IntroProgressDots({ total, current }: { total: number, current: number }) {
  return (
    <div className="flex-center" style={{ gap: '8px', padding: '16px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? '24px' : '8px',
          height: '8px',
          borderRadius: '4px',
          backgroundColor: i === current ? 'var(--color-primary)' : 'var(--color-border)',
          transition: 'all 0.3s ease'
        }} />
      ))}
    </div>
  );
}

export function MissingAssetState({ name }: { name: string }) {
  return (
    <div className="flex-center flex-col" style={{
      width: '100%',
      aspectRatio: '1',
      backgroundColor: 'var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '24px',
      color: 'var(--color-text-secondary)',
      border: '2px dashed #9CA3AF'
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <span style={{ fontSize: '14px', textAlign: 'center' }}>صورة مفقودة</span>
      <span style={{ fontSize: '12px', marginTop: '4px', fontFamily: 'monospace' }}>{name}</span>
    </div>
  );
}
