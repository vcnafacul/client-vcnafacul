import Youtube from "react-youtube";

interface Props {
  videoId: string;
  /** Título acessível do iframe. */
  title?: string;
  className?: string;
}

/** Player 16:9 na largura do pai. Mesmo `react-youtube` do "Quem somos". */
export function YoutubePlayer({ videoId, title = "Vídeo da lição", className }: Props) {
  return (
    <div className={`w-full aspect-video overflow-hidden rounded-lg bg-black ${className ?? ""}`}>
      <Youtube
        videoId={videoId}
        title={title}
        className="h-full w-full"
        iframeClassName="h-full w-full"
        opts={{ width: "100%", height: "100%", playerVars: { rel: 0 } }}
      />
    </div>
  );
}
