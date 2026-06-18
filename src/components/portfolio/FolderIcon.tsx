type Props = { color?: string; size?: number };

export function FolderIcon({ color = "#3B6FCC", size = 120 }: Props) {
  return (
    <svg
      width={size}
      height={size * 0.82}
      viewBox="0 0 200 164"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ filter: "drop-shadow(0 12px 24px rgba(15, 23, 42, 0.18))" }}
    >
      <defs>
        <linearGradient id={`tab-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`body-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`front-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      {/* back tab */}
      <path
        d="M8 28 C8 21 13 16 20 16 H78 L92 30 H180 C187 30 192 35 192 42 V148 C192 155 187 160 180 160 H20 C13 160 8 155 8 148 Z"
        fill={`url(#tab-${color})`}
      />
      {/* front body */}
      <path
        d="M8 50 C8 43 13 38 20 38 H180 C187 38 192 43 192 50 V148 C192 155 187 160 180 160 H20 C13 160 8 155 8 148 Z"
        fill={`url(#body-${color})`}
      />
      <path
        d="M8 50 C8 43 13 38 20 38 H180 C187 38 192 43 192 50 V148 C192 155 187 160 180 160 H20 C13 160 8 155 8 148 Z"
        fill={`url(#front-${color})`}
      />
      {/* highlight */}
      <path
        d="M8 50 C8 43 13 38 20 38 H180 C187 38 192 43 192 50 V54 H8 Z"
        fill="#ffffff"
        fillOpacity="0.18"
      />
    </svg>
  );
}
