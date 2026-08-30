import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link2, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET = "gallery";

/** Compress + convert to WebP so phone photos upload fast. */
export async function toWebP(file: File, maxSide = 1800, quality = 0.8): Promise<File> {
  if (!file.type.startsWith("image/") || file.type.includes("gif") || file.type.includes("svg")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadImageFile(file: File, folder = "uploads"): Promise<string> {
  const optimized = await toWebP(file);
  const ext = optimized.name.split(".").pop() || "webp";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, optimized, {
    cacheControl: "31536000",
    upsert: false,
    contentType: optimized.type,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  /** Small square preview (logos, avatars) instead of a wide banner preview. */
  square?: boolean;
  hint?: string;
}

export const ImageUpload = ({
  label = "Image",
  value,
  onChange,
  folder = "uploads",
  square = false,
  hint,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImageFile(file, folder);
      onChange(url);
      toast.success("Image uploaded");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Upload failed — check your access rights");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-9"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
          {busy ? "Uploading..." : "Upload photo"}
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-9" onClick={() => setShowUrl((v) => !v)}>
          <Link2 className="w-4 h-4 mr-1" />
          {showUrl ? "Hide link" : "Use link"}
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" className="h-9 text-destructive" onClick={() => onChange("")}>
            <X className="w-4 h-4 mr-1" />Remove
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {showUrl && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /lovable-uploads/logo.png"
          className="h-9 text-sm"
        />
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {value && (
        <div className={square ? "w-20 h-20 rounded-lg overflow-hidden bg-muted" : "w-full max-w-md h-28 rounded-lg overflow-hidden bg-muted"}>
          <img
            src={value}
            alt="Preview"
            className={square ? "w-full h-full object-contain" : "w-full h-full object-cover"}
            onError={(e) => (e.currentTarget.style.opacity = "0.2")}
          />
        </div>
      )}
    </div>
  );
};
