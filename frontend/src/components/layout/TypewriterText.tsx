import React, { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 22,
  className,
}) => {
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visibleLength, setVisibleLength] = useState(reduceMotion ? text.length : 0);

  useEffect(() => {
    if (reduceMotion) return;
    let length = 0;
    const timer = window.setInterval(() => {
      length = Math.min(length + 2, text.length);
      setVisibleLength(length);
      if (length >= text.length) window.clearInterval(timer);
    }, delay);

    return () => window.clearInterval(timer);
  }, [delay, reduceMotion, text]);

  return (
    <span className={className} aria-label={text}>
      {text.slice(0, visibleLength)}
      {visibleLength < text.length && (
        <span aria-hidden="true" className="typing-caret ml-0.5 inline-block h-[1em] w-px translate-y-0.5 bg-current" />
      )}
    </span>
  );
};
