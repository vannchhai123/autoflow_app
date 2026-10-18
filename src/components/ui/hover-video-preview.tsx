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

  // Auto-resolve thumbnail URL if not provided directly
  const resolvedThumbnail =
    thumbnailUrl ||
    (src && src.includes("/storage/videos/")
      ? src.replace("/storage/videos/", "/storage/thumbnails/").replace(/\.mp4(\?.*)?$/i, ".jpg")
      : null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!src || hasVideoError) return;

    // Small debounce (120ms) so rapid sweeping does not trigger unneeded plays
    timerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        video.muted = true;
        const promise = video.play();
        if (promise !== undefined) {
          promise
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
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
      } catch {
        // ignore seek errors on pause
      }
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
        "relative overflow-hidden group/video select-none bg-neutral-900",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Background Poster Gradient (fallback while media loads or for draft videos) */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b transition-opacity duration-500",
          gradient,
          (showThumbnailImage && isImgLoaded) || isVideoLoaded ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Static / Dedicated Thumbnail Image */}
      {showThumbnailImage && (
        <img
          src={resolvedThumbnail!}
          alt="Video Thumbnail"
          loading="lazy"
          onLoad={() => setIsImgLoaded(true)}
          onError={() => setHasImgError(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 pointer-events-none",
            isImgLoaded ? (isPlaying ? "opacity-0" : "opacity-100") : "opacity-0"
          )}
        />
      )}

      {/* Real Hover Video Demo & Video Frame Fallback */}
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
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 pointer-events-none",
            // If image is active and loaded, video is only visible while playing.
            // If no image, video is ALWAYS visible once loaded (serving as the thumbnail + live hover demo)!
            showThumbnailImage && isImgLoaded
              ? isPlaying ? "opacity-100" : "opacity-0"
              : isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Cinematic subtle scrim gradient to guarantee text/badge contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60 pointer-events-none z-1" />

      {/* Children Overlays (Badges, Menus, Duration indicators, Play buttons, etc.) */}
      {children}
    </div>
  );
}
