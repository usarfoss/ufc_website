'use client';

import React from 'react';

interface FaultyTerminalProps {
  scale?: number;
  gridMul?: [number, number];
}

const FaultyTerminal: React.FC<FaultyTerminalProps> = ({ scale = 1, gridMul = [1, 1] }) => {
  return (
    <div 
      className="w-full h-full bg-black/20"
      style={{
        transform: `scale(${scale})`,
        backgroundImage: `
          linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: `${20 * gridMul[0]}px ${20 * gridMul[1]}px`,
      }}
    />
  );
};

export default FaultyTerminal;
