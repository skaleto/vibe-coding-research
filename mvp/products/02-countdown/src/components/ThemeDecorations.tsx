import type { Theme } from '@/lib/themes';

/**
 * Tiny library of theme-specific SVG ornaments rendered as absolutely-positioned
 * accent layers. Keep these strictly visual — no business logic.
 */

export function PinkRibbon({ size = 36, color = '#FF6B9D' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 22c0-5 6-10 18-10s18 5 18 10c0 5-6 10-18 10S14 27 14 22Z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M14 22c4 4 14 4 18 0 4 4 14 4 18 0-4 8-12 12-18 12s-14-4-18-12Z"
        fill={color}
      />
      <circle cx="32" cy="22" r="6" fill="#FFD700" />
      <path
        d="M32 32 22 60M32 32 42 60"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PinkSparkle({ size = 18, color = '#FFD700' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 2 14 10 22 12 14 14 12 22 10 14 2 12 10 10Z"
        fill={color}
      />
    </svg>
  );
}

export function InkSeal({ size = 44, char = '记' }: { size?: number; char?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#7A1F1F',
        color: '#FBF9F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily:
          '"Source Han Serif CN", "Noto Serif SC", "Songti SC", serif',
        fontSize: size * 0.5,
        fontWeight: 700,
        borderRadius: 3,
        letterSpacing: 0,
        transform: 'rotate(-3deg)',
        boxShadow: 'inset 0 0 0 2px rgba(251,249,242,0.65)',
      }}
      aria-hidden
    >
      {char}
    </div>
  );
}

export function CyberCorner({ color = '#00F5FF' }: { color?: string }) {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M0 8 V0 H8" stroke={color} strokeWidth="2" fill="none" />
      <path d="M28 20 V28 H20" stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

export function FilmDateStamp({ date }: { date: string }) {
  return (
    <span
      style={{
        fontFamily:
          '"Courier New", "IBM Plex Mono", "Special Elite", monospace',
        color: '#D4943F',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textShadow: '0 0 1px rgba(255, 200, 80, 0.4)',
      }}
    >
      {date}
    </span>
  );
}

/** Theme-aware decoration cluster used by widget/poster corners. */
export function ThemeOrnaments({ theme }: { theme: Theme }) {
  switch (theme.id) {
    case 'pink':
      return (
        <>
          <div className="absolute top-3 right-3">
            <PinkRibbon size={32} />
          </div>
          <div className="absolute bottom-4 left-4 flex gap-1">
            <PinkSparkle />
            <PinkSparkle size={14} color="#B8E2F2" />
          </div>
        </>
      );
    case 'ink':
      return (
        <div className="absolute bottom-4 right-4">
          <InkSeal />
        </div>
      );
    case 'cyber':
      return (
        <>
          <div className="absolute top-2 left-2">
            <CyberCorner />
          </div>
          <div className="absolute bottom-2 right-2 rotate-180">
            <CyberCorner color="#FF006E" />
          </div>
        </>
      );
    case 'film':
      return null; // perforations handled by ThemedSurface decoration class
    case 'minimal':
    default:
      return null;
  }
}
