'use client';

import React from 'react';
import Image from 'next/image';
import { PERSONAS } from '../../profile-selection/config/personas';
import { useRouter } from 'next/navigation';
import { JourneyProgressHero } from './JourneyProgressHero';
import { logoutProfile } from '@/features/player/actions';

export function DashboardHeader({ profile }: { profile?: { id: string; name: string; avatarId?: string; avatarUrl?: string; } }) {
  const router = useRouter();

  const selectedPersona = PERSONAS.find(p => p.id === profile?.avatarId);

  return (
    <header className="dashboard-header">
      <div className="header-child-info">
        <div className="header-avatar">
          {selectedPersona && (
            <Image src={selectedPersona.imageSrc} alt="صورة الملف الشخصي" fill sizes="56px" style={{ objectFit: 'cover' }} />
          )}
        </div>
        <div className="header-welcome">
          <span className="welcome-text">أهلًا يا {profile?.name || 'بطل'}</span>
          <span className="welcome-sub">اختر جزيرتك وابدأ رحلتك مع الحروف والأصوات</span>
        </div>
      </div>

      <JourneyProgressHero />

      <div className="header-actions">
        <button 
          className="btn-back"
          onClick={async () => {
            await logoutProfile();
            router.push('/profiles');
          }}
        >
          <span>&rarr;</span> تغيير الشخصية
        </button>
      </div>
    </header>
  );
}
