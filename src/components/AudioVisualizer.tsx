import React, { useEffect, useRef } from 'react';
import { audioEngine, PlaybackStatus } from '../services/audioEngine';

interface AudioVisualizerProps {
  status: PlaybackStatus;
  barCount?: number;
  colorTheme?: string;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = React.memo(({
  status,
  barCount = 20,
  colorTheme = 'from-cyan-400 to-blue-600',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationId: number | null = null;
    const analyser = audioEngine.getAudioAnalyser();
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    let phase = 0;

    const drawStatic = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = Math.max(2, (width / barCount) - 2);
      ctx.fillStyle = '#334155';

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const barHeight = 4;
        const y = height - barHeight;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    };

    if (status === 'idle' || status === 'paused' || prefersReducedMotion) {
      drawStatic();
      return;
    }

    let lastTime = 0;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const targetFps = isMobile ? 20 : 25; // 20 FPS on mobile, 25 FPS on desktop
    const fpsInterval = 1000 / targetFps;

    // Increment active visualizer loop count in dev mode
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      (window as any).__DEV_VISUALIZER_LOOPS__ = ((window as any).__DEV_VISUALIZER_LOOPS__ || 0) + 1;
    }

    const stopLoop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const render = (currentTime: number) => {
      if (document.visibilityState === 'hidden') {
        stopLoop();
        return;
      }

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) {
        animationId = requestAnimationFrame(render);
        return;
      }
      lastTime = currentTime - (elapsed % fpsInterval);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const isPlaying = status === 'playing';

      let hasRealAudio = false;
      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        for (let j = 0; j < Math.min(10, dataArray.length); j++) {
          if (dataArray[j] > 0) {
            hasRealAudio = true;
            break;
          }
        }
      }

      const barWidth = Math.max(2, (width / barCount) - 2);
      const gradient = ctx.createLinearGradient(0, height, 0, 0);

      if (colorTheme.includes('cyan') || colorTheme.includes('neon')) {
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#a855f7');
      } else if (colorTheme.includes('orchid') || colorTheme.includes('purple')) {
        gradient.addColorStop(0, '#c084fc');
        gradient.addColorStop(0.5, '#e879f9');
        gradient.addColorStop(1, '#f43f5e');
      } else if (colorTheme.includes('slate') || colorTheme.includes('teal')) {
        gradient.addColorStop(0, '#14b8a6');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#38bdf8');
      } else {
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#f97316');
        gradient.addColorStop(1, '#ef4444');
      }

      ctx.fillStyle = gradient;
      phase += 0.18;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;

        if (isPlaying) {
          if (hasRealAudio && dataArray && dataArray[i]) {
            barHeight = Math.max(4, (dataArray[i] / 255) * height);
          } else {
            const s1 = Math.sin(phase * 1.5 + i * 0.5);
            const s2 = Math.cos(phase * 2.2 + i * 0.8);
            const s3 = Math.sin(phase * 0.7 + i * 1.2);
            const combined = (s1 + s2 + s3 + 3) / 6;
            const variance = 0.35 + ((i * 7 + 3) % 11) * 0.06;
            barHeight = Math.max(5, combined * (height - 2) * variance);
          }
        } else if (status === 'connecting' || status === 'buffering') {
          barHeight = Math.max(4, Math.sin(phase + i * 0.4) * (height / 2.5) + (height / 3));
        }

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    if (document.visibilityState === 'visible') {
      animationId = requestAnimationFrame(render);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (status === 'playing' || status === 'connecting')) {
        if (animationId === null) {
          animationId = requestAnimationFrame(render);
        }
      } else if (document.visibilityState === 'hidden') {
        stopLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopLoop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (import.meta.env.DEV && typeof window !== 'undefined') {
        (window as any).__DEV_VISUALIZER_LOOPS__ = Math.max(0, ((window as any).__DEV_VISUALIZER_LOOPS__ || 1) - 1);
      }
    };
  }, [status, barCount, colorTheme]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={32}
      className={`rounded-md ${className}`}
    />
  );
});

