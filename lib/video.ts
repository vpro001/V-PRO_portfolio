export type ParsedVideo =
  | { kind: "youtube"; id: string }
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string };

/** Understands YouTube, Vimeo, Google Drive and direct video file links. */
export function parseVideo(url?: string | null): ParsedVideo | null {
  if (!url) return null;
  const value = url.trim();
  if (!/^https?:\/\//i.test(value)) return null;

  const yt = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i
  );
  if (yt) return { kind: "youtube", id: yt[1] };

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { kind: "embed", src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/drive\.google\.com/i.test(value)) {
    const id = value.match(/\/file\/d\/([\w-]+)/)?.[1] || value.match(/[?&]id=([\w-]+)/)?.[1];
    return id ? { kind: "embed", src: `https://drive.google.com/file/d/${id}/preview` } : null;
  }

  if (/\.(mp4|webm|ogg|m4v|mov)(\?.*)?$/i.test(value)) return { kind: "file", src: value };

  return null;
}
