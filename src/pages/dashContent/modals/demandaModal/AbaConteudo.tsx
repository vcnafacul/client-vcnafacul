import { YoutubePlayer } from "@/components/atoms/youtubePlayer";
import { Button } from "@/components/ui/button";
import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { StatusEnum } from "@/enums/generic/statusEnum";

interface Props {
  demand: ContentDtoInput;
  temMaterial: boolean;
  ehVideo: boolean;
  canUpload: boolean;
  onDownload: () => void;
  onVisualizar: () => void;
  onProporAjuste: () => void;
}

/** O material em si: descrição, motivo da rejeição, player ou documento, e Propor Ajuste. */
export function AbaConteudo({
  demand,
  temMaterial,
  ehVideo,
  canUpload,
  onDownload,
  onVisualizar,
  onProporAjuste,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm whitespace-pre-wrap break-words">
        {demand.description}
      </p>

      {demand.status === StatusEnum.Rejected && demand.rejectionReason && (
        <div
          role="note"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3"
        >
          <p className="text-sm font-black text-rose-800">
            Motivo da rejeição:
          </p>
          <p className="text-sm text-rose-900 whitespace-pre-wrap break-words">
            {demand.rejectionReason}
          </p>
        </div>
      )}

      {temMaterial && ehVideo && demand.file?.videoId && (
        <YoutubePlayer videoId={demand.file.videoId} title={demand.title} />
      )}

      {temMaterial ? (
        <div className="flex flex-wrap gap-2">
          {!ehVideo && (
            <>
              <Button variant="outline" onClick={onDownload}>
                Download
              </Button>
              <Button
                className="bg-marine hover:bg-marine/80"
                onClick={onVisualizar}
              >
                Visualizar
              </Button>
            </>
          )}
          {canUpload && (
            <Button variant="outline" onClick={onProporAjuste}>
              Propor Ajuste
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Esta demanda ainda não tem material enviado.
        </p>
      )}
    </div>
  );
}
