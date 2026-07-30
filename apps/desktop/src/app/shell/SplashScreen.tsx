import { FC, useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export const SplashScreen: FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  const [fading, setFading] = useState<boolean>(false);

  const steps = [
    'Initializing Core Kernel & IPC Bridge...',
    'Loading Security Permission Broker...',
    'Connecting Vault & Hash-Chained Event Store...',
    'Verifying Department Capability Ceilings...',
    'Loading Workspace Session & Design Tokens...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        setFading(true);
        setTimeout(onComplete, 600);
        return prev;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  return (
    <div
      aria-label="App Startup Splash Screen"
      role="region"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--sd-color-bg-app, #0f172a)',
        color: 'var(--sd-color-text, #f8fafc)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out',
        pointerEvents: fading ? 'none' : 'auto',
        fontFamily: 'var(--sd-font-sans, system-ui, sans-serif)',
      }}
    >
      {/* Brand Icon / Logo */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          fontWeight: 'bold',
          color: '#ffffff',
          boxShadow: '0 20px 50px rgba(99, 102, 241, 0.4)',
          marginBottom: 24,
        }}
      >
        T
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(to right, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        THEKY / Sidra OS
      </h1>
      <p
        style={{
          margin: '8px 0 32px 0',
          fontSize: 14,
          color: 'var(--sd-color-text-muted, #64748b)',
        }}
      >
        Sovereign Enterprise Operating System
      </p>

      {/* Progress Bar Container */}
      <div
        style={{
          width: 280,
          height: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((step + 1) / steps.length) * 100}%`,
            backgroundColor: '#6366f1',
            borderRadius: 2,
            transition: 'width 0.25s ease-out',
          }}
        />
      </div>

      {/* Current Loading Step Label */}
      <span
        style={{
          fontSize: 12,
          color: '#94a3b8',
          fontFamily: 'var(--sd-font-mono, monospace)',
        }}
      >
        {steps[step]}
      </span>
    </div>
  );
};
