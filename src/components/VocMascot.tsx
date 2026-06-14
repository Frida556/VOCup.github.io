import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  className?: string;
  mood?: "feliz" | "pensativo" | "motivado" | "tranquilo";
  color?: string; // hex or css color, default brand sky
  floating?: boolean;
}

export function VocMascot({ size = 140, className, mood = "feliz", color, floating = true }: Props) {
  const fill = color ?? "var(--sky)";
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", floating && "animate-voc-float", className)}
      style={{ width: size, height: size }}
      aria-label={`Voc - ${mood}`}
    >
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id="vocBody" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="40%" stopColor={fill as string} stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.9" />
          </radialGradient>
          <radialGradient id="vocShine" cx="30%" cy="25%" r="20%">
            <stop offset="0%" stopColor="white" stopOpacity="0.95" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Glow */}
        <ellipse cx="100" cy="175" rx="50" ry="6" fill="var(--sky)" opacity="0.35" />
        {/* Body */}
        <circle cx="100" cy="95" r="70" fill="url(#vocBody)" stroke="white" strokeOpacity="0.7" strokeWidth="2" />
        <circle cx="80" cy="70" r="18" fill="url(#vocShine)" />
        {/* Wing */}
        <path d="M155 55 Q175 50 178 70 Q170 72 158 72 Z" fill="white" opacity="0.85" />
        {/* Eyes */}
        <g className="animate-voc-blink">
          <circle cx="82" cy="100" r="9" fill="#0a1840" />
          <circle cx="118" cy="100" r="9" fill="#0a1840" />
          <circle cx="85" cy="97" r="3" fill="white" />
          <circle cx="121" cy="97" r="3" fill="white" />
        </g>
        {/* Mouth */}
        {mood === "feliz" && (
          <path d="M85 125 Q100 140 115 125" stroke="#0a1840" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}
        {mood === "motivado" && (
          <path d="M85 125 Q100 145 115 125 Z" fill="#ff5b7a" stroke="#0a1840" strokeWidth="2.5" />
        )}
        {mood === "pensativo" && (
          <path d="M88 130 Q100 125 112 130" stroke="#0a1840" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {mood === "tranquilo" && (
          <path d="M88 128 Q100 134 112 128" stroke="#0a1840" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}
