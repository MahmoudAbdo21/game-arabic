import React from 'react';

type IntroButtonProps = React.ComponentProps<'button'> & {
  className?: string;
};

export function IntroButton({ className = '', children, ...props }: IntroButtonProps) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
