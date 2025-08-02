import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
}

const ConfettiEffect: React.FC = () => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const colors = [
    '#F97316', '#EF4444', '#F59E0B', '#10B981', '#EC4899',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F43F5E', '#6366F1'
  ];

  const createConfettiPiece = (id: number): ConfettiPiece => ({
    id,
    x: Math.random() * window.innerWidth,
    y: -10,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
    velocity: {
      x: (Math.random() - 0.5) * 4,
      y: Math.random() * 3 + 2,
    },
  });

  const triggerConfetti = () => {
    setIsActive(true);
    const pieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < 50; i++) {
      pieces.push(createConfettiPiece(i));
    }
    
    setConfetti(pieces);

    // Clear confetti after animation
    setTimeout(() => {
      setConfetti([]);
      setIsActive(false);
    }, 3000);
  };

  useEffect(() => {
    const handleTaskCompleted = () => {
      triggerConfetti();
    };

    window.addEventListener('taskCompleted', handleTaskCompleted);
    return () => window.removeEventListener('taskCompleted', handleTaskCompleted);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              opacity: 1,
            }}
            animate={{
              x: piece.x + piece.velocity.x * 100,
              y: window.innerHeight + 100,
              rotate: piece.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: 3,
              ease: 'easeOut',
            }}
            className="absolute"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiEffect;