import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "project-media";
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_GALLERY = 20;
const MAX_WIDTH = 2560;

// Real MIME validation — extension is not enough.
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_DOC_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
// Magic-byte signatures for the main image types.
const MAGIC_BYTES: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF (verify WEBP at offset 8)
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
];

async function detectMime(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  for (const sig of MAGIC_BYTES) {
    if (sig.bytes.every((b, i) => head[i] === b)) {
      if (sig.mime === "image/webp") {
        const tag = String.fromCharCode(head[8], head[9], head[10], head[11]);
        if (tag !== "WEBP") continue;
      }
      return sig.mime;
    }
  }
  // pptx is a zip; trust browser-reported mime as fallback for office docs
  if (file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    return file.type;
  }
  return null;
}

function hasSuspiciousName(name: string): boolean {
  // Reject executables, scripts, double extensions like image.jpg.exe
  const lower = name.toLowerCase();
  if (/\.(exe|sh|bat|cmd|com|js|mjs|cjs|php|py|rb|jar|msi|dll|svg|html?)$/.test(lower)) return true;
  // Double-extension where the inner ext is image and outer is anything weird
  const parts = lower.split(".");
  if (parts.length > 2) {
    const inner = parts[parts.length - 2];
    if (["jpg", "jpeg", "png", "webp", "pdf"].includes(inner)) return true;
  }
  return false;
}

async function compressImageToWebP(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > MAX_WIDTH) {
    height = Math.round((MAX_WIDTH / width) * height);
    width = MAX_WIDTH;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression échouée"))),
      "image/webp",
      0.85,
    );
  });
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function uploadOne(
  file: File,
  slugHint: string,
  kind: "cover" | "gallery",
  index?: number,
): Promise<string> {
  if (file.size > MAX_SIZE) throw new Error(`${file.name} dépasse 50 Mo`);
  if (hasSuspiciousName(file.name)) throw new Error(`Nom de fichier refusé : ${file.name}`);
  const realMime = await detectMime(file);
  if (!realMime) throw new Error(`Format non reconnu : ${file.name}`);
  const isImage = ALLOWED_IMAGE_MIME.has(realMime);
  const isDoc = ALLOWED_DOC_MIME.has(realMime);
  if (!isImage && !isDoc) throw new Error(`Type non autorisé : ${realMime}`);

  let uploadBlob: Blob = file;
  let ext = realMime === "application/pdf" ? "pdf"
    : realMime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? "pptx"
    : "webp";
  let contentType = realMime;

  if (isImage) {
    uploadBlob = await compressImageToWebP(file);
    contentType = "image/webp";
    ext = "webp";
  }

  const safeSlug = (slugHint || "projet").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const name =
    kind === "cover"
      ? `${safeSlug}-cover-${uuid().slice(0, 8)}.${ext}`
      : `${safeSlug}-gallery-${String((index ?? 0) + 1).padStart(2, "0")}-${uuid().slice(0, 8)}.${ext}`;
  const path = `${safeSlug}/${name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, uploadBlob, { contentType, upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function extractPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i + marker.length);
}

async function removeFromStorage(url: string) {
  const path = extractPath(url);
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

// ============ Cover uploader ============
export function CoverUploader({
  value,
  onChange,
  slugHint,
}: {
  value: string;
  onChange: (url: string) => void;
  slugHint: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files)[0];
      if (!file) return;
      setBusy(true);
      setErr(null);
      try {
        if (value) await removeFromStorage(value).catch(() => {});
        const url = await uploadOne(file, slugHint, "cover");
        onChange(url);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setBusy(false);
      }
    },
    [onChange, slugHint, value],
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
          drag ? "bg-muted" : ""
        }`}
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-sm">
          {busy ? "Upload en cours…" : "Déposez une image ici ou cliquez pour choisir"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          JPG, PNG, WEBP, PDF · max 50 Mo · auto-converti en WebP
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      {value && (
        <div className="relative inline-block">
          <img src={value} alt="" className="max-h-40 rounded-lg" />
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Supprimer cette image ?")) return;
              await removeFromStorage(value).catch(() => {});
              onChange("");
            }}
            className="absolute top-1 right-1 rounded-full bg-black/70 text-white text-[10px] px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ou collez une URL externe (optionnel)"
        className="w-full rounded-lg border px-3 py-2 text-xs bg-transparent"
        style={{ borderColor: "var(--color-border)" }}
      />
    </div>
  );
}

// ============ Gallery uploader ============
export function GalleryUploader({
  value,
  onChange,
  slugHint,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  slugHint: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      if (!arr.length) return;
      if (value.length + arr.length > MAX_GALLERY) {
        setErr(`Maximum ${MAX_GALLERY} images dans la galerie`);
        return;
      }
      setBusy(true);
      setErr(null);
      const next = [...value];
      try {
        for (let i = 0; i < arr.length; i++) {
          const url = await uploadOne(arr[i], slugHint, "gallery", value.length + i);
          next.push(url);
          onChange([...next]);
        }
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setBusy(false);
      }
    },
    [onChange, slugHint, value],
  );

  async function removeAt(i: number) {
    if (!confirm("Supprimer cette image ?")) return;
    const url = value[i];
    await removeFromStorage(url).catch(() => {});
    onChange(value.filter((_, j) => j !== i));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...value];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
          drag ? "bg-muted" : ""
        }`}
        style={{ borderColor: "var(--color-border)" }}
      >
        <p className="text-sm">
          {busy
            ? "Upload en cours…"
            : `Déposez plusieurs images ou cliquez pour ajouter (${value.length}/${MAX_GALLERY})`}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Sélection multiple · auto-compression WebP
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
      {err && <p className="text-xs text-red-500">{err}</p>}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {value.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIdx !== null) reorder(dragIdx, i);
                setDragIdx(null);
              }}
              className="relative group aspect-square rounded-lg overflow-hidden border cursor-move"
              style={{ borderColor: "var(--color-border)" }}
              title="Glisser pour réorganiser"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 top-0 flex justify-between p-1">
                <span className="bg-black/70 text-white text-[10px] px-1.5 rounded">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="bg-black/70 text-white text-[10px] px-1.5 rounded opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] py-0.5 text-center opacity-0 group-hover:opacity-100"
              >
                Aperçu
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
