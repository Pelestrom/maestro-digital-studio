import photoshopAsset from "@/assets/photoshop.png.asset.json";
import canvaAsset from "@/assets/canva.png.asset.json";
import dalleAsset from "@/assets/dalle.jpg.asset.json";

const MAP: Array<{ match: RegExp; url: string; label: string }> = [
  { match: /photoshop|ps\b/i, url: photoshopAsset.url, label: "Photoshop" },
  { match: /canva/i, url: canvaAsset.url, label: "Canva" },
  { match: /dall[\s\W]?e|openai/i, url: dalleAsset.url, label: "DALL·E" },
];

export function toolIconFor(name: string) {
  return MAP.find((m) => m.match.test(name));
}

export function ToolBadge({ name, size = 28 }: { name: string; size?: number }) {
  const icon = toolIconFor(name);
  if (!icon) {
    return (
      <span
        className="label-mono rounded-full border px-3 py-1 text-[10px]"
        style={{ borderColor: "var(--color-blue-accent)", color: "var(--color-blue-accent)" }}
      >
        {name}
      </span>
    );
  }
  return (
    <span
      title={icon.label}
      aria-label={icon.label}
      className="inline-flex items-center justify-center rounded-full border bg-white"
      style={{ width: size, height: size, borderColor: "var(--color-border)" }}
    >
      <img src={icon.url} alt={icon.label} className="w-[68%] h-[68%] object-contain" />
    </span>
  );
}
