
'use client';

import React, { useState, useEffect } from 'react';

export const AnimatedBackground = () => {
  const [shapes, setShapes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generatedShapes = [];
    const shapeCount = 20;

    for (let i = 0; i < shapeCount; i++) {
      const type = Math.random() > 0.5 ? 'bar' : 'number';
      const style = {
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 20 + 15}s`,
        animationDelay: `${Math.random() * -20}s`,
        opacity: Math.random() * 0.15 + 0.05,
      };

      if (type === 'bar') {
        generatedShapes.push(<div key={`shape-${i}`} className="shape bar" style={style} />);
      } else {
        const number = Math.floor(Math.random() * 9000) + 1000;
        generatedShapes.push(
          <div key={`shape-${i}`} className="shape number" style={{...style, fontSize: `${Math.random() * 16 + 8}px`}}>
            {number}
          </div>
        );
      }
    }
    setShapes(generatedShapes);
  }, []);

  return (
    <div className="animated-background">
      {shapes}
    </div>
  );
};
