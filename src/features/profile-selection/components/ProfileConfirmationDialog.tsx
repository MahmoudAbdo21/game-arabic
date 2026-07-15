'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Persona } from '../config/personas';
import { useRouter } from 'next/navigation';
import { useVisualPreview } from '../state/visual-preview-profile-store';
import { createProfile } from '@/features/player/actions';
import styles from '../styles/ProfileSelection.module.css';

interface ProfileConfirmationDialogProps {
  persona: Persona;
  onClose: () => void;
}

export function ProfileConfirmationDialog({ persona, onClose }: ProfileConfirmationDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const { setPreviewState } = useVisualPreview();

  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
    
    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validateName = (val: string) => {
    const trimmed = val.trim().normalize();
    if (trimmed.length < 2) return 'الاسم يجب أن يحتوي على حرفين على الأقل';
    if (trimmed.length > 24) return 'الاسم طويل جداً';
    if (/^[0-9]+$/.test(trimmed)) return 'الاسم لا يمكن أن يكون أرقاماً فقط';
    // Reject HTML/control chars, but accept Arabic, Latin, spaces, etc.
    if (/[<>{}\[\]\\]/.test(trimmed)) return 'يحتوي الاسم على رموز غير مسموحة';
    return '';
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError('');
  };

  const handleConfirm = async () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await createProfile(name.trim().normalize(), persona.id);
      router.push('/dashboard');
    } catch (e) {
      setError('حدث خطأ أثناء إنشاء الملف الشخصي. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <dialog 
      ref={dialogRef} 
      className={`${styles.profileDialog} profile-dialog`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose(); // Backdrop click
      }}
    >
      <div className={styles.profileDialogContent} onClick={e => e.stopPropagation()}>
        <button 
          type="button" 
          className={styles.dialogCloseIcon} 
          onClick={onClose}
          aria-label="إغلاق"
        >
          ✕
        </button>
        
        <div className={styles.dialogPersonaShowcase}>
          <div className={styles.dialogImageWrapper}>
            <Image src={persona.imageSrc} alt={persona.imageAlt} fill sizes="120px" className={styles.dialogImage} />
          </div>
          <h2 className={styles.dialogTitle}>{persona.title}</h2>
          <p className={styles.dialogTrait}>{persona.trait}</p>
        </div>

        <div className={styles.dialogForm}>
          <label htmlFor="childNameInput" className={styles.dialogLabel}>
            ما اسم البطل الذي سيبدأ الرحلة؟
          </label>
          <input
            id="childNameInput"
            type="text"
            className={`${styles.dialogInput} ${error ? styles.dialogInputError : ''}`}
            value={name}
            onChange={handleNameChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
            }}
            placeholder="اكتب اسمك هنا"
            autoFocus
          />
          {error && <div className={styles.dialogErrorMsg}>{error}</div>}
        </div>

        <div className={styles.dialogActions}>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleConfirm}
            disabled={name.trim().length < 2}
          >
            استعد لبدء الرحلة
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
          >
            اختيار شخصية أخرى
          </button>
        </div>
      </div>
    </dialog>
  );
}
