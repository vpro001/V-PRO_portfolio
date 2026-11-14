"use client";

import { useEffect, useRef } from "react";
import { parseVideo } from "@/lib/video";

interface YTPlayer {
  destroy(): void;
  getCurrentTime(): number;
}
interface YTNamespace {
  Player: new (el: HTMLElement, options: Record<string, unknown>) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApi: Promise<YTNamespace> | null = null;
function loadYouTube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeApi) {
    youtubeApi = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT!);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        youtubeApi = null;
        reject(new Error("YouTube player failed to load"));
      };
      document.head.appendChild(script);
    });
  }
  return youtubeApi;
}

interface Props {
  url: string;
  title: string;
  /** Resume point in seconds. */
  startAt?: number;
  onEnded?: () => void;
  /** Called every few seconds while playing, and on pause. */
  onPosition?: (seconds: number) => void;
}

/**
 * Plays YouTube, Vimeo, Google Drive and direct video files. YouTube and file
 * videos report position and completion; plain embeds can't, so the learner
 * marks those lessons complete by hand.
 */
export default function VideoPlayer({ url, title, startAt = 0, onEnded, onPosition }: Props) {
  const video = parseVideo(url);
  const mount = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onEnded, onPosition });
  callbacks.current = { onEnded, onPosition };

  const youtubeId = video?.kind === "youtube" ? video.id : "";

  useEffect(() => {
    if (!youtubeId || !mount.current) return;
    let player: YTPlayer | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    // YouTube replaces the node we hand it, so give it one React doesn't own.
    const target = document.createElement("div");
    mount.current.appendChild(target);

    const report = () => {
      const seconds = player?.getCurrentTime?.();
      if (typeof seconds === "number") callbacks.current.onPosition?.(seconds);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    loadYouTube()
      .then((YT) => {
        if (cancelled) return;
        player = new YT.Player(target, {
          videoId: youtubeId,
          width: "100%",
          height: "100%",
          host: "https://www.youtube-nocookie.com",
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, start: Math.floor(startAt) },
          events: {
            onStateChange: (event: { data: number }) => {
              stop();
              if (event.data === 1) timer = setInterval(report, 10000);
              if (event.data === 2) report();
              if (event.data === 0) callbacks.current.onEnded?.();
            },
          },
        });
      })
      .catch(() => {
        // Fall back to a plain embed if the API script is blocked.
        if (cancelled) return;
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?start=${Math.floor(startAt)}`;
        iframe.title = title;
        iframe.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";
        iframe.className = "h-full w-full";
        target.replaceWith(iframe);
      });

    const node = mount.current;
    return () => {
      cancelled = true;
      stop();
      try {
        player?.destroy();
      } catch {}
      node.replaceChildren();
    };
    // startAt is only read when the lesson first loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  const frame = "relative aspect-video w-full overflow-hidden bg-black";

  if (!video) {
    return (
      <div className={`${frame} flex items-center justify-center p-6 text-center`}>
        <p className="max-w-sm text-sm text-white/70">
          This video link isn&rsquo;t in a format the player understands. Supported: YouTube, Vimeo,
          Google Drive, or a direct .mp4 / .webm file.
        </p>
      </div>
    );
  }

  if (video.kind === "youtube") {
    return <div ref={mount} className={`${frame} [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full`} />;
  }

  if (video.kind === "file") {
    return (
      <div className={frame}>
        <video
          src={video.src}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full"
          onLoadedMetadata={(e) => {
            if (startAt > 0 && startAt < e.currentTarget.duration - 5) e.currentTarget.currentTime = startAt;
          }}
          onPause={(e) => onPosition?.(e.currentTarget.currentTime)}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            if (Math.floor(t) % 10 === 0) onPosition?.(t);
          }}
          onEnded={() => onEnded?.()}
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <div className={frame}>
      <iframe
        src={video.src}
        title={title}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
