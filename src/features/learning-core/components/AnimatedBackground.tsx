import React from 'react';
import styles from './AnimatedBackground.module.css';

export function AnimatedBackground() {
  return (
    <div className={styles.animatedBg}>
      <div className={`${styles.particle} ${styles.p1}`}>أ</div>
      <div className={`${styles.particle} ${styles.p2}`}>ب</div>
      <div className={`${styles.particle} ${styles.p3}`}>١</div>
      <div className={`${styles.particle} ${styles.p4}`}>ت</div>
      <div className={`${styles.particle} ${styles.p5}`}>٢</div>
      <div className={`${styles.particle} ${styles.p6}`}>ث</div>
      <div className={`${styles.sparkle} ${styles.s1}`}>✨</div>
      <div className={`${styles.sparkle} ${styles.s2}`}>✨</div>
      <div className={`${styles.sparkle} ${styles.s3}`}>⭐</div>
    </div>
  );
}