"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HoverVideoPreviewProps {
  src?: string | null;
  thumbnailUrl?: string | null;
  gradient?: string;
  className?: string;
  children?: ReactNode;
  showIndicator?: boolean;
  onClick?: () => void;
}

export function HoverVideoPreview({
  src,
  thumbnailUrl,
  gradient,
  className,
  children,
  showIndicator = true,
  onClick,
}: HoverVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedThumbnail =
    thumbnailUrl ||
    (src && src.includes("/storage/videos/")
      ? src
          .replace("/storage/videos/", "/storage/thumbnails/")
          .replace(/\.mp4(\?.*)?$/i, ".jpg")
      : null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!src || hasVideoError) return;

    timerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        video.muted = true;
        const promise = video.play();
        if (promise !== undefined) {
          promise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    }, 120);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      try {
        video.currentTime = 0.05;
      } catch {}
    }
    setIsPlaying(false);
  };

  const showThumbnailImage = Boolean(resolvedThumbnail && !hasImgError);

  return (
    <div
      onClick={(e) => {
        if (!onClick) return;
        const target = e.target as HTMLElement | null;
        if (target && target.closest("button, a, [role='menuitem'], [data-state]")) {
          return;
        }
        onClick();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/video relative overflow-hidden bg-neutral-900 select-none",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-opacity duration-500",
          gradient,
          (showThumbnailImage && isImgLoaded) || isVideoLoaded
            ? "opacity-0"
            : "opacity-100",
        )}
      />

      {showThumbnailImage && (
        <img
          src={resolvedThumbnail!}
          alt="Video Thumbnail"
          loading="lazy"
          onLoad={() => setIsImgLoaded(true)}
          onError={() => setHasImgError(true)}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            isImgLoaded ? (isPlaying ? "opacity-0" : "opacity-100") : "opacity-0",
          )}
        />
      )}

      {src && !hasVideoError && (
        <video
          ref={videoRef}
          src={src.includes("#t=") ? src : `${src}#t=0.05`}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setHasVideoError(true)}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300",

            showThumbnailImage && isImgLoaded
              ? isPlaying
                ? "opacity-100"
                : "opacity-0"
              : isVideoLoaded
                ? "opacity-100"
                : "opacity-0",
          )}
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-1 bg-gradient-to-b from-black/45 via-transparent to-black/60" />

      {children}
    </div>
  );
}
