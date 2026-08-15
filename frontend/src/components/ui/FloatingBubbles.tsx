"use client";

import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
}

interface FloatingBubblesProps {
  count?: number;
  className?: string;
}

export default function FloatingBubbles({ count = 18, className = "" }: FloatingBubblesProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        size: Math.random() * 24 + 8,
        left: Math.random() * 100,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
      }))
    );
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-[-50px] rounded-full bg-white/20 border border-white/40 backdrop-blur-[1px] animate-float-bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}