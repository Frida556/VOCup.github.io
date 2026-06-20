import { cn } from "@/lib/utils";
import logoAsset from "@/assets/vocup-logo.png.asset.json";

export function Logo({
  height = 44,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <img
      src={logoAsset.url}
      alt="VocUp — Guía de futuro digital"
      loading="eager"
      className={cn("object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );
}
