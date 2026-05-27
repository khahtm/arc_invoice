'use client';

import { useEffect, useRef } from 'react';

export function UsdcCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    const img = el.querySelector('img') as HTMLImageElement;
    img.style.transition = 'transform 0.2s ease';

    const onMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.opacity = '1';

      const target = e.target as HTMLElement;
      const isButton = target.closest('button, a, [role="button"]');
      img.style.transform = isButton ? 'scale(1.5)' : 'scale(1)';
    };

    const onLeave = () => { el.style.opacity = '0'; };
    const onEnter = () => { el.style.opacity = '1'; };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed z-[9999] pointer-events-none opacity-0"
      style={{ animation: 'spin-slow 3s linear infinite' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/usdc-cursor.svg" alt="" width={40} height={40} draggable={false} />
    </div>
  );
}
