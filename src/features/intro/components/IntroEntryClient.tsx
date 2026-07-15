'use client';

import { useRouter } from 'next/navigation';
import { IntroExperience } from './IntroExperience';
import { useRef, useCallback } from 'react';

export function IntroEntryClient() {
  const router = useRouter();
  const hasCompleted = useRef(false);

  const handleComplete = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    router.push('/profiles');
  }, [router]);

  return <IntroExperience onComplete={handleComplete} />;
}
