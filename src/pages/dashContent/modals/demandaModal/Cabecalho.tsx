import { Badge } from "@/components/ui/badge";
import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { pessoasDe, statusDaDemanda } from "./helpers";
import { PessoasDaDemanda } from "./PessoasDaDemanda";

interface Props {
  demand: ContentDtoInput;
  /** "Pedida por" no modal de envio; "Criada por" na validação. */
  papelDoCriador?: string;
}

/** Título, tipo, status e quem fez o quê — o mesmo cabeçalho no envio e na validação. */
export function Cabecalho({ demand, papelDoCriador = "Criada por" }: Props) {
  const temMaterial = !!(
    demand.file?.id ?? (demand.file as { _id?: string } | undefined)?._id
  );
  const status = statusDaDemanda(Number(demand.status));
  const pessoas = pessoasDe(demand).map((p, i) =>
    i === 0 ? { ...p, papel: papelDoCriador } : p,
  );
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-bold text-marine break-words">
          {demand.title}
        </h2>
        {temMaterial && (
          <Badge variant="outline" className="font-medium">
            {demand.file?.tipo === "video" ? "Vídeo" : "Documento"}
          </Badge>
        )}
        <Badge
          variant="outline"
          className={`border-transparent ${status.classe}`}
        >
          {status.rotulo}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {demand.subject?.frente?.nome}
        {demand.subject?.frente?.nome && demand.subject?.name && " · "}
        {demand.subject?.name}
      </p>
      <PessoasDaDemanda pessoas={pessoas} />
    </header>
  );
}
