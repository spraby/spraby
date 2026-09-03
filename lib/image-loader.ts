import type {ImageLoaderProps} from 'next/image';

/**
 * Serves product images straight from S3, without resizing on the Next.js server.
 *
 * The API stores downscaled copies ("renditions") next to every WebP original:
 *   brands/1/images/{uuid}.webp      original, up to 2000 px
 *   brands/1/images/{uuid}_800.webp  800 px on the longer side
 *   brands/1/images/{uuid}_400.webp  400 px on the longer side
 *
 * For a requested width we pick the smallest rendition that is at least that wide,
 * falling back to the original. Naming rules live in api/app/Services/ImageRenditions.php
 * and RENDITION_WIDTHS must match ImageRenditions::WIDTHS there.
 */
const RENDITION_WIDTHS = [400, 800] as const;

const RENDITION_HOSTS = new Set(['spraby.s3.eu-north-1.amazonaws.com']);

const WEBP_EXTENSION = /\.webp$/i;

export default function imageLoader({src, width}: ImageLoaderProps): string {
  const url = parseRenditionSource(src);
  if (!url) return src;

  const renditionWidth = RENDITION_WIDTHS.find(candidate => width <= candidate);
  if (!renditionWidth) return src;

  url.pathname = url.pathname.replace(WEBP_EXTENSION, `_${renditionWidth}.webp`);
  return url.toString();
}

/**
 * Only absolute URLs to our bucket pointing at a WebP file have renditions.
 * Everything else (local assets, GIF/SVG, third-party URLs) is served as is.
 */
function parseRenditionSource(src: string): URL | null {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }

  if (!RENDITION_HOSTS.has(url.hostname)) return null;
  if (!WEBP_EXTENSION.test(url.pathname)) return null;

  return url;
}
