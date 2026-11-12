// A photo that is resized and compressed for each screen (next/image), smaller on phones,
// in modern formats (AVIF/WebP). Photos from a website not allowed in next.config.ts
// (e.g. a link pasted in the admin panel) are shown as they are instead of breaking the page.
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Keep in sync with images.remotePatterns in next.config.ts
const ALLOWED_HOSTS = new Set(["images.unsplash.com", "i.pinimg.com", "img.youtube.com", new URL(API).host]);

export function canOptimize(src: string) {
  if (src.startsWith("/")) return !src.startsWith("//");
  try {
    const url = new URL(src);
    if (!ALLOWED_HOSTS.has(url.host)) return false;
    // Backend photos only from its file folder
    return url.host !== new URL(API).host || url.pathname.startsWith("/api/files/");
  } catch {
    return false;
  }
}

type Props = {
  src: string;
  alt: string;
  className?: string;
  // How wide the photo is shown, so phones get a small file, e.g. "(max-width: 768px) 100vw, 33vw"
  sizes?: string;
  // The photo at the top of the page: loaded first
  priority?: boolean;
  // Shape of the original (the CSS size still wins): only used to reserve space
  width?: number;
  height?: number;
};

export default function SmartImage({ src, alt, className, sizes = "100vw", priority, width = 1600, height = 1067 }: Props) {
  if (!src) return null;
  if (!canOptimize(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
