import { cn } from "@/lib/utils";
import logoAsset from "@/assets/vocup-logo.png.asset.json";

export function Logo({ size = 32, withWordmark = true, className }: { size?: number; withWordmark?: boolean; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <img
        src={logoAsset.url}
        alt="VocUp"
        width={size * 1.6}
        height={size}
        loading="eager"
        className="object-contain"
        style={{ height: size, width: "auto" }}
      />
      {withWordmark && (
        <span className="font-bold tracking-tight text-deep" style={{ fontSize: size * 0.55 }}>
          voc<span className="text-primary">UP</span>
        </span>
      )}
    </div>
  );
}
