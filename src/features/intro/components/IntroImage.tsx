'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface IntroImageProps {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}

export function IntroImage({
  src,
  alt = '',
  className = '',
  priority = false,
}: IntroImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [src]);

  return (
    <motion.img
      ref={imgRef}
      src={src}
      alt={alt}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageLoaded(true)}
      initial={{ opacity: 0 }}
      animate={{ opacity: imageLoaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
