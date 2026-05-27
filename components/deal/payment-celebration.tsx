'use client';

import { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatUSDC } from '@/lib/utils';
import { X } from 'lucide-react';

interface PaymentCelebrationProps {
  amount: number;
  milestoneDescription: string;
  onClose: () => void;
}

function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#005FFE', '#00E5FF', '#FFB800', '#FF5C00', '#2128BD'];

  // Initial burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });

  // Side cannons
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.7 },
    colors,
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.7 },
    colors,
  });

  // Continuous sparkle
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 15,
      spread: 100,
      startVelocity: 20,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors,
      gravity: 0.6,
    });
  }, 200);
}

function USDCToken({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute pointer-events-none animate-usdc-fly"
      style={style}
    >
      <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#2775CA]/30">
        $
      </div>
    </div>
  );
}

export function PaymentCelebration({ amount, milestoneDescription, onClose }: PaymentCelebrationProps) {
  const [tokens, setTokens] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fireConfetti();

    // Spawn flying USDC tokens
    const newTokens = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      style: {
        left: `${10 + Math.random() * 80}%`,
        bottom: '-40px',
        animationDelay: `${i * 0.15}s`,
        animationDuration: `${1.5 + Math.random() * 1.5}s`,
      } as React.CSSProperties,
    }));
    setTokens(newTokens);

    const timer = setTimeout(() => {
      setTokens([]);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {tokens.map((t) => (
        <USDCToken key={t.id} style={t.style} />
      ))}

      <Card className="relative z-10 p-8 max-w-sm mx-4 text-center animate-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold">Payment Received!</h2>
        </div>

        <div className="bg-[#005FFE]/5 rounded-2xl p-4 mb-4">
          <p className="text-3xl font-medium font-mono text-[#005FFE]">{formatUSDC(amount)}</p>
          <p className="text-sm text-muted-foreground mt-1">USDC</p>
        </div>

        <p className="text-sm text-muted-foreground mb-6">{milestoneDescription}</p>

        <Button onClick={handleClose} className="w-full">
          Continue
        </Button>
      </Card>
    </div>
  );
}
