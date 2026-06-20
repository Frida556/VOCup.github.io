import { cn } from "@/lib/utils";
import vocAsset from "@/assets/voc-mascot.png.asset.json";

interface Props {
  size?: number;
  className?: string;
  mood?: "feliz" | "pensativo" | "motivado" | "tranquilo";
  color?: string; // hex; applies a subtle tint via hue-rotate when set
  floating?: boolean;
  glow?: boolean;
}

// Map known palette colors to hue-rotate degrees over the silver base
function tintFor(color?: string): string | undefined {
  if (!color) return undefined;
  const map: Record<string, string> = {
    "#7cc4ff": "hue-rotate(190deg) saturate(1.3)",
    "#5ce0c8": "hue-rotate(140deg) saturate(1.4)",
    "#c79cff": "hue-rotate(265deg) saturate(1.3)",
    "#ffa6c1": "hue-rotate(320deg) saturate(1.4)",
    "#9be38b": "hue-rotate(95deg) saturate(1.3)",
    "#f0c265": "hue-rotate(40deg) saturate(1.5)",
  };
  return map[color] ?? `hue-rotate(0deg)`;
}

export function VocMascot({ size = 140, className, mood = "feliz", color, floating = true, glow = true }: Props) {
  const filter = tintFor(color);
  return (
    <div
      className={cn("relative inline-flex items-center justify-center select-none", floating && "animate-voc-float", className)}
      style={{ width: size, height: size }}
      aria-label={`Voc - ${mood}`}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60"
          style={{ background: "radial-gradient(closest-side, var(--sky), transparent 70%)" }}
          aria-hidden
        />
      )}
      <img
        src={vocAsset.url}
        alt="Voc, tu compañero vocacional"
        width={size}
        height={size}
        loading="lazy"
        draggable={false}
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(40,80,160,0.25)]"
        style={filter ? { filter } : undefined}
      />
    </div>
  );
}
