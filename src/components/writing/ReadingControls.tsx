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

  return (
    <div
      className="flex flex-wrap items-center gap-4 mb-4"
      role="group"
      aria-label="Controles de lectura"
    >
      {series.image && (
        <img
          src={series.image}
          alt=""
          className="w-12 h-12 rounded object-cover shrink-0"
          width="48"
          height="48"
        />
      )}
      <div className="flex flex-col min-w-0">
        <h2 className="text-lg font-bold text-foreground truncate">
          {currentRead.title}
        </h2>
        <p className="text-sm text-muted">{currentRead.date}</p>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <a
          href={prevSlug ? `${basePath}/${prevSlug}` : undefined}
          aria-label="Lectura anterior"
          aria-disabled={!prevSlug}
          className={`inline-flex p-2 border-2 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
            prevSlug
              ? "border-accent text-accent hover:bg-accent/10 cursor-pointer"
              : "border-border text-muted cursor-not-allowed opacity-50 pointer-events-none"
          }`}
          tabIndex={prevSlug ? 0 : -1}
        >
          <i class="ph ph-caret-left text-xl" aria-hidden="true" />
        </a>
        <a
          href={nextSlug ? `${basePath}/${nextSlug}` : undefined}
          aria-label="Siguiente lectura"
          aria-disabled={!nextSlug}
          className={`inline-flex p-2 border-2 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
            nextSlug
              ? "border-accent text-accent hover:bg-accent/10 cursor-pointer"
              : "border-border text-muted cursor-not-allowed opacity-50 pointer-events-none"
          }`}
          tabIndex={nextSlug ? 0 : -1}
        >
          <i class="ph ph-caret-right text-xl" aria-hidden="true" />
        </a>
        {currentRead.isFavorite && (
          <span
            className="inline-flex p-2 text-accent"
            aria-label="Favorito del autor"
          >
            <i class="ph-fill ph-star text-xl" aria-hidden="true" />
          </span>
        )}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Compartir enlace"
          className="inline-flex p-2 border-2 border-accent text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <i class="ph ph-share-network text-xl" aria-hidden="true" />
        </button>
        {shareConfirmation && (
          <span
            className="text-sm text-accent"
            role="status"
            aria-live="polite"
          >
            ¡Enlace copiado!
          </span>
        )}
      </div>
    </div>
  );
}
