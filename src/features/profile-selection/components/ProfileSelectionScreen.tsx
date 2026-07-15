'use client';

import React, { useState } from 'react';
import { PERSONAS, Persona } from '../config/personas';
import { ProfileConfirmationDialog } from './ProfileConfirmationDialog';
import { ProfileEducationalBackdrop } from './ProfileEducationalBackdrop';
import { useRouter } from 'next/navigation';
import { loginProfile, deleteProfile } from '@/features/player/actions';
import Image from 'next/image';
import styles from '../styles/ProfileSelection.module.css';
import { useAudio } from '@/providers/AudioProvider';

interface ProfileSelectionScreenProps {
  profiles: Array<{ id: string; name: string; avatarUrl: string; avatarId?: string; isNew?: boolean; isLocked?: boolean; role?: string; }>;
}

export function ProfileSelectionScreen({ profiles }: ProfileSelectionScreenProps) {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { play, isUnlocked } = useAudio();

  React.useEffect(() => {
    play('global-profiles-welcome');
  }, [play]);

  const handleLogin = async (profileId: string) => {
    await loginProfile(profileId);
    router.push('/dashboard');
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProfile(profileToDelete.id);
      setProfileToDelete(null);
      router.refresh(); // Refresh server props to reflect deletion
    } catch (error) {
      console.error('Failed to delete profile:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.profileShell}>
      <ProfileEducationalBackdrop mode="academic" />
      
      <header className={styles.profileHeader}>
        <button className={styles.btnBack} onClick={() => router.push('/')}>
          <span>&rarr;</span> العودة
        </button>
        <div className={styles.profileHeaderCenter}>
          <h1 className={styles.profileTitle}>مرحباً بك في اللعبة</h1>
          <p className={styles.profileSubtitle}>اختر بطلاً للمتابعة أو أضف بطلاً جديداً</p>
          {!isUnlocked && (
            <button 
              onClick={() => play('global-profiles-welcome')} 
              style={{ marginTop: 8, padding: '4px 12px', background: '#fff', color: '#333', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
              ▶ تشغيل الصوت الترحيبي
            </button>
          )}
        </div>
      </header>

      <main className={styles.profileStage}>
        <section className={styles.profileSection}>
          <div className={styles.personaGrid}>
            
            {/* Existing Profiles */}
            {profiles.map(p => {
              const pInfo = PERSONAS.find(x => x.id === p.avatarId) || PERSONAS[0];
              return (
                <div 
                  key={p.id} 
                  className={`${styles.personaCard} persona-card`}
                  onClick={() => handleLogin(p.id)} 
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleLogin(p.id)}
                >
                  <button 
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileToDelete({ id: p.id, name: p.name });
                    }}
                    title="حذف هذا البطل"
                  >
                    <svg className={styles.deleteIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <div className={styles.personaImageWrapper}>
                    <Image src={pInfo.imageSrc} alt={pInfo.imageAlt} fill sizes="120px" className={styles.personaImage} />
                  </div>
                  <h3 className={styles.personaName} title={p.name}>{p.name}</h3>
                  <p className={styles.personaRole}>{pInfo.title}</p>
                </div>
              );
            })}

            {/* Create New Profile Button */}
            <div 
              className={`${styles.createCard} create-card`}
              onClick={() => setShowAvatarSelector(true)}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setShowAvatarSelector(true)}
            >
              <div className={styles.createIcon}>+</div>
              <div className={styles.createText}>إضافة بطل جديد</div>
            </div>

          </div>
        </section>
      </main>

      {/* Avatar Selection Modal */}
      {showAvatarSelector && !selectedPersona && (
        <div className={styles.modalOverlay} onClick={() => setShowAvatarSelector(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowAvatarSelector(false)}>✕</button>
            <h2 className={styles.modalTitle}>اختر شخصية البطل الجديد</h2>
            <div className={styles.avatarGrid}>
              {PERSONAS.map(persona => (
                <div 
                  key={persona.id} 
                  className={`${styles.avatarCard} avatar-card`}
                  onClick={() => setSelectedPersona(persona)}
                >
                  <div className={styles.avatarImageWrapper}>
                    <Image src={persona.imageSrc} alt={persona.imageAlt} fill sizes="180px" className={styles.personaImage} />
                  </div>
                  <div className={styles.avatarName}>{persona.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Name Creation Dialog */}
      {selectedPersona && (
        <ProfileConfirmationDialog 
          persona={selectedPersona} 
          onClose={() => {
            setSelectedPersona(null);
            setShowAvatarSelector(false);
          }} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {profileToDelete && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setProfileToDelete(null)}>
          <div className={`${styles.profileDialogContent} ${styles.deleteConfirmContent}`} onClick={e => e.stopPropagation()}>
            <div className={styles.deleteWarningIcon}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className={styles.dialogTitle}>هل أنت متأكد من رغبتك في حذف هذا البطل؟</h2>
            <p className={styles.dialogTrait} style={{ marginBottom: 16 }}>سيتم حذف <strong>{profileToDelete.name}</strong> وجميع تقدمه بشكل دائم.</p>
            
            <div className={styles.deleteConfirmActions}>
              <button 
                className={styles.btnConfirmDelete}
                onClick={handleDeleteProfile}
                disabled={isDeleting}
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، قم بالحذف'}
              </button>
              <button 
                className={styles.btnCancelDelete}
                onClick={() => setProfileToDelete(null)}
                disabled={isDeleting}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
