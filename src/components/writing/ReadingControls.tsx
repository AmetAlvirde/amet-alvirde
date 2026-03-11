import { useState, useCallback } from "react";

interface Read {
  slug: string;
  title: string;
  date: string;
  isFavorite: boolean;
}

interface Series {
  slug: string;
  title: string;
  image: string;
}

interface ReadingControlsProps {
  series: Series;
  reads: Read[];
  currentIndex: number;
  basePath?: string;
}

export default function ReadingControls({
  series,
  reads,
  currentIndex,
  basePath = "/writing",
}: ReadingControlsProps) {
  const [shareConfirmation, setShareConfirmation] = useState(false);

  const currentRead = reads[currentIndex];
  if (!currentRead) return null;

  const prevSlug = currentIndex > 0 ? reads[currentIndex - 1]?.slug : null;
  const nextSlug =
    currentIndex < reads.length - 1 ? reads[currentIndex + 1]?.slug : null;

  const handleShare = useCallback(async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}${basePath}/${currentRead.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareConfirmation(true);
      setTimeout(() => setShareConfirmation(false), 2000);
    } catch {
      // Fallback or silent fail
    }
  }, [currentRead.slug, basePath]);

  const smallControlBtn =
    "inline-flex items-center justify-center size-10 border-0 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-full shrink-0";
  const enabledBtn =
    "text-accent-as-surface-foreground hover:opacity-80 cursor-pointer";
  const disabledBtn =
    "text-accent-as-surface-foreground/40 cursor-not-allowed pointer-events-none";

  return (
    <div
      className="flex flex-col gap-5 border-2 border-accent-as-surface bg-accent-as-surface text-accent-as-surface-foreground no-underline transition-all duration-150 w-full py-5 px-4 mb-8 rounded-2xl md:py-6 md:px-6"
      role="group"
      aria-label="Controles de lectura"
    >
      {/* Top: track info (music player style) */}
      <div className="flex items-center gap-3">
        {series.image && (
          <img
            src={series.image}
            alt=""
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
            width="64"
            height="64"
          />
        )}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <h1 className="text-lg xs:text-xl sm:text-2xl font-bold tracking-wider uppercase leading-tight truncate">
            {currentRead.title}
          </h1>
          <p className="text-base tracking-wider opacity-90 font-bold font-mono uppercase">
            {currentRead.date}
          </p>
        </div>
      </div>

      {/* Bottom: star aligned with album cover; prev/share/next always centered */}
      <div className="flex items-center w-full pt-1 pb-1">
        <div className="w-14 h-10 sm:w-16 shrink-0 flex items-center justify-start">
          {currentRead.isFavorite && (
            <span
              className="inline-flex items-center justify-center size-10 shrink-0"
              aria-label="Favorito del autor"
            >
              <i className="ph-fill ph-star text-3xl" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="flex-1 flex justify-center items-center gap-4">
          <a
            href={prevSlug ? `${basePath}/${prevSlug}` : undefined}
            aria-label="Lectura anterior"
            aria-disabled={!prevSlug}
            className={`${smallControlBtn} ${
              prevSlug ? enabledBtn : disabledBtn
            }`}
            tabIndex={prevSlug ? 0 : -1}
          >
            <i
              className="ph-fill ph-rewind text-4xl text-inherit"
              aria-hidden="true"
            />
          </a>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartir enlace"
            className="inline-flex items-center justify-center size-16 border-0 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded-full shrink-0 text-accent-as-surface-foreground hover:opacity-80 cursor-pointer"
          >
            <i className="ph ph-export text-5xl" aria-hidden="true" />
          </button>
          <a
            href={nextSlug ? `${basePath}/${nextSlug}` : undefined}
            aria-label="Siguiente lectura"
            aria-disabled={!nextSlug}
            className={`${smallControlBtn} ${
              nextSlug ? enabledBtn : disabledBtn
            }`}
            tabIndex={nextSlug ? 0 : -1}
          >
            <i
              className="ph-fill ph-fast-forward text-4xl text-inherit"
              aria-hidden="true"
            />
          </a>
          {shareConfirmation && (
            <span
              className="text-sm opacity-90 ml-1"
              role="status"
              aria-live="polite"
            >
              ¡Enlace copiado!
            </span>
          )}
        </div>
        <div className="w-14 sm:w-16 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
