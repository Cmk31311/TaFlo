'use client';

import { useEffect } from 'react';

export default function MouseParticles() {
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;
    let moveTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;

      // Clear existing timeout
      if (moveTimeout) {
        clearTimeout(moveTimeout);
      }

      // Create particle trail
      createParticle(mouseX, mouseY);

      // Set timeout to stop movement
      moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 100);
    };

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement('div');
      particle.className = 'mouse-particle';
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';

      // Randomize particle properties
      const colors = [
        'rgba(34,211,238,0.9)', // cyan
        'rgba(168,85,247,0.9)', // purple
        'rgba(236,72,153,0.9)', // pink
        'rgba(34,197,94,0.9)',  // green
        'rgba(250,204,21,0.9)'  // yellow
      ];
      
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = `radial-gradient(circle, ${randomColor} 0%, ${randomColor.replace('0.9', '0.3')} 70%, transparent 100%)`;
      
      // Randomize size
      const size = Math.random() * 4 + 3;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      document.body.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 2000);
    };

    // Add mouse move listener
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (moveTimeout) {
        clearTimeout(moveTimeout);
      }
    };
  }, []);

  return null;
}

