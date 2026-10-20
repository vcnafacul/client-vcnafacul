import { YoutubePlayer } from "@/components/atoms/youtubePlayer";
import { Input } from "@/components/ui/input";
import { extrairYoutubeId } from "@/utils/youtubeId";

interface Props {
  value: string;
  /** `videoId` é null quando o link não é um vídeo normal do YouTube. */
  onChange: (url: string, videoId: string | null) => void;
}

export const MENSAGEM_LINK_INVALIDO =
  "Informe um link do YouTube válido (vídeo normal, não Shorts ou live).";

/** Link do YouTube com preview: quem envia vê o vídeo antes de salvar. */
export function VideoLinkField({ value, onChange }: Props) {
  const videoId = value.trim() ? extrairYoutubeId(value) : null;
  const invalido = value.trim() !== "" && !videoId;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor="video-url">
        Link do YouTube
      </label>
      <Input
        id="video-url"
        placeholder="https://www.youtube.com/watch?v=…"
        value={value}
        onChange={(e) => onChange(e.target.value, extrairYoutubeId(e.target.value))}
        aria-invalid={invalido}
      />
      {invalido && (
        <p role="alert" className="text-sm text-red-700">
          {MENSAGEM_LINK_INVALIDO}
        </p>
      )}
      {videoId && <YoutubePlayer videoId={videoId} title="Pré-visualização do vídeo" />}
    </div>
  );
}
