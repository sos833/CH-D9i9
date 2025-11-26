
'use client';

import React, { useState, useEffect } from 'react';

export const AnimatedBackground = () => {
  const [shapes, setShapes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const s = [];
    for (let i = 0; i < 20; i++) {
      const type = Math.random() > 0.5 ? 'bar' : 'curve';
      const style = {
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 20 + 10}s`,
        animationDelay: `${Math.random() * -20}s`,
        opacity: Math.random() * 0.15 + 0.05,
      };
      s.push(<div key={`shape-${i}`} className={`shape ${type}`} style={style} />);
    }
    setShapes(s);
  }, []);

  return (
    <div className="animated-background">
      {shapes}
    </div>
  );
};
