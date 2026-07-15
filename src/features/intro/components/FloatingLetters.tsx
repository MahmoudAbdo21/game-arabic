'use client';

import { motion, useReducedMotion } from 'framer-motion';
import styles from '../styles/Intro.module.css';

const arabicLetters = ['أ', 'ب', 'ت', 'م', 'س', 'ن', 'ر', 'ل', 'ي', 'و'];

const colors = [
  styles.textPrimary,
  styles.textSecondary,
  styles.textAccent,
  styles.textMint,
  styles.textPink,
  styles.textSuccess,
];

const floatingConfigs = arabicLetters.map((_, i) => {
  const startX = 8 + ((i * 17) % 82);
  const startY = 12 + ((i * 23) % 76);
  const animY1 = 18 + ((i * 11) % 46);
  const animY2 = 10 + ((i * 7) % 38);
  const duration = 4 + (i % 3) * 0.8;

  return { startX, startY, animY1, animY2, duration };
});

export function FloatingLetters() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={styles.floatingLettersOverlay} aria-hidden="true">
      {arabicLetters.map((letter, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${floatingConfigs[i].startX}%`,
            y: `${floatingConfigs[i].startY}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: shouldReduceMotion ? `${floatingConfigs[i].animY1}%` : [`${floatingConfigs[i].animY1}%`, `${floatingConfigs[i].animY2}%`],
            opacity: shouldReduceMotion ? 0.4 : [0.3, 0.6, 0.3],
            scale: shouldReduceMotion ? 1 : [0.8, 1.2, 0.8],
            rotate: shouldReduceMotion ? 0 : [0, 10, -10, 0],
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : floatingConfigs[i].duration,
            repeat: shouldReduceMotion ? 0 : Infinity,
            delay: shouldReduceMotion ? 0 : i * 0.3,
            ease: 'easeInOut',
          }}
          className={`${styles.floatingLetter} ${colors[i % colors.length]}`}
          style={{
            left: `${5 + (i * 10) % 90}%`,
          }}
        >
          {letter}
        </motion.div>
      ))}
    </div>
  );
}
