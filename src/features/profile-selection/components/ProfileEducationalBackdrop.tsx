import React from 'react';
import styles from '../styles/ProfileEducationalBackdrop.module.css';

type MotifMode = 'academic' | 'adventure';

interface MotifItem {
  id: string;
  char: string;
  size: 'lg' | 'md' | 'sm';
  x: string; /* percentage */
  y: string; /* percentage */
  r: number; /* rotation in deg */
  color: 'green' | 'gold' | 'aqua';
  opacity: number;
  layer: 1 | 2 | 3; /* 1=large, 2=small, 3=geometric */
}

/* Deterministic motifs data */
const academicMotifs: MotifItem[] = [
  // Large Layer
  { id: 'a-1', char: 'أ', size: 'lg', x: '5%', y: '10%', r: -15, color: 'green', opacity: 0.08, layer: 1 },
  { id: 'a-2', char: 'ب', size: 'lg', x: '88%', y: '15%', r: 10, color: 'gold', opacity: 0.07, layer: 1 },
  { id: 'a-3', char: 'ت', size: 'lg', x: '10%', y: '80%', r: 20, color: 'aqua', opacity: 0.06, layer: 1 },
  { id: 'a-4', char: 'ث', size: 'lg', x: '85%', y: '75%', r: -10, color: 'green', opacity: 0.08, layer: 1 },
  // Small Layer
  { id: 'a-5', char: '١', size: 'md', x: '45%', y: '8%', r: -5, color: 'gold', opacity: 0.12, layer: 2 },
  { id: 'a-6', char: '٢', size: 'md', x: '55%', y: '85%', r: 15, color: 'green', opacity: 0.12, layer: 2 },
  { id: 'a-7', char: 'ج', size: 'md', x: '25%', y: '90%', r: -12, color: 'aqua', opacity: 0.1, layer: 2 },
  { id: 'a-8', char: 'ح', size: 'md', x: '75%', y: '90%', r: 8, color: 'gold', opacity: 0.1, layer: 2 },
  { id: 'a-9', char: 'خ', size: 'sm', x: '2%', y: '45%', r: 5, color: 'green', opacity: 0.12, layer: 2 },
  { id: 'a-10', char: 'د', size: 'sm', x: '95%', y: '45%', r: -5, color: 'gold', opacity: 0.12, layer: 2 },
  // Geometric Layer
  { id: 'a-11', char: '✦', size: 'sm', x: '35%', y: '15%', r: 0, color: 'gold', opacity: 0.08, layer: 3 },
  { id: 'a-12', char: '✦', size: 'sm', x: '65%', y: '75%', r: 45, color: 'green', opacity: 0.06, layer: 3 },
  { id: 'a-13', char: '●', size: 'sm', x: '15%', y: '25%', r: 0, color: 'aqua', opacity: 0.05, layer: 3 },
  { id: 'a-14', char: '●', size: 'sm', x: '85%', y: '35%', r: 0, color: 'gold', opacity: 0.07, layer: 3 },
];

const adventureMotifs: MotifItem[] = [
  // Large Layer
  { id: 'v-1', char: 'س', size: 'lg', x: '8%', y: '12%', r: -12, color: 'green', opacity: 0.09, layer: 1 },
  { id: 'v-2', char: 'ش', size: 'lg', x: '85%', y: '20%', r: 18, color: 'aqua', opacity: 0.08, layer: 1 },
  { id: 'v-3', char: 'ص', size: 'lg', x: '5%', y: '70%', r: 10, color: 'gold', opacity: 0.09, layer: 1 },
  { id: 'v-4', char: 'ض', size: 'lg', x: '90%', y: '80%', r: -15, color: 'green', opacity: 0.08, layer: 1 },
  // Small Layer
  { id: 'v-5', char: '٣', size: 'md', x: '40%', y: '6%', r: 5, color: 'aqua', opacity: 0.14, layer: 2 },
  { id: 'v-6', char: '٤', size: 'md', x: '60%', y: '85%', r: -10, color: 'gold', opacity: 0.14, layer: 2 },
  { id: 'v-7', char: '٥', size: 'sm', x: '50%', y: '92%', r: 12, color: 'green', opacity: 0.12, layer: 2 },
  { id: 'v-8', char: 'ط', size: 'md', x: '20%', y: '85%', r: 8, color: 'green', opacity: 0.11, layer: 2 },
  { id: 'v-9', char: 'ظ', size: 'sm', x: '80%', y: '8%', r: -8, color: 'gold', opacity: 0.11, layer: 2 },
  { id: 'v-10', char: 'ع', size: 'md', x: '3%', y: '50%', r: -20, color: 'aqua', opacity: 0.1, layer: 2 },
  { id: 'v-11', char: 'غ', size: 'md', x: '97%', y: '50%', r: 20, color: 'gold', opacity: 0.1, layer: 2 },
  // Geometric Layer
  { id: 'v-12', char: '★', size: 'sm', x: '25%', y: '20%', r: 15, color: 'gold', opacity: 0.1, layer: 3 },
  { id: 'v-13', char: '★', size: 'sm', x: '70%', y: '80%', r: -15, color: 'aqua', opacity: 0.08, layer: 3 },
  { id: 'v-14', char: '〰', size: 'sm', x: '10%', y: '35%', r: 45, color: 'green', opacity: 0.07, layer: 3 },
  { id: 'v-15', char: '〰', size: 'sm', x: '88%', y: '65%', r: -30, color: 'gold', opacity: 0.07, layer: 3 },
  { id: 'v-16', char: '●', size: 'sm', x: '35%', y: '88%', r: 0, color: 'green', opacity: 0.06, layer: 3 },
];

export function ProfileEducationalBackdrop({ mode }: { mode: MotifMode }) {
  const motifs = mode === 'academic' ? academicMotifs : adventureMotifs;

  return (
    <div className={styles.educationalBackdrop} aria-hidden="true">
      {motifs.map(motif => {
        const sizeClass = motif.size === 'lg' ? styles.motifSizeLg : motif.size === 'md' ? styles.motifSizeMd : styles.motifSizeSm;
        const colorClass = motif.color === 'green' ? styles.motifColorGreen : motif.color === 'gold' ? styles.motifColorGold : styles.motifColorAqua;
        const layerClass = motif.layer === 1 ? styles.motifLayer1 : motif.layer === 2 ? styles.motifLayer2 : styles.motifLayer3;
        
        const classNames = [
          styles.motifGlyph,
          sizeClass,
          colorClass,
          layerClass
        ].join(' ');

        return (
          <span 
            key={motif.id}
            className={classNames}
            style={{
              left: motif.x,
              top: motif.y,
              transform: `rotate(${motif.r}deg)`,
              '--base-opacity': motif.opacity,
            } as React.CSSProperties}
          >
            {motif.char}
          </span>
        );
      })}
    </div>
  );
}
