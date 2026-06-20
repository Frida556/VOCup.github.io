import { cn } from "@/lib/utils";
import iconAsset from "@/assets/vocup-logo.png.asset.json";

export function Logo({
  size = 32,
  withWordmark = true,
  className,
  variant = "deep",
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  variant?: "deep" | "light";
}) {
  const word = variant === "light" ? "text-white" : "text-deep";
  const accent = variant === "light" ? "text-sky" : "text-primary";
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <img
        src={iconAsset.url}
        alt="VocUp"
        loading="eager"
        className="object-contain"
        style={{ height: size, width: size }}
      />
      {withWordmark && (
        <span className={cn("font-extrabold tracking-tight leading-none", word)} style={{ fontSize: size * 0.62 }}>
          voc<span className={accent}>UP</span>
        </span>
      )}
    </div>
  );
}
