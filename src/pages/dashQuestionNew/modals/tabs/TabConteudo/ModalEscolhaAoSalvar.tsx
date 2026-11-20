import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  escolhaSugerida,
  textoDaCorrecao,
  textoDaNovaVersao,
  TEXTO_SEM_NOVA_VERSAO,
  separarProvas,
  type ProvaDaQuestao,
  type EscolhaDeEdicao,
} from "./escolhaAoSalvar";

export const TITULO = "Como salvar esta alteração?";

/**
 * A escolha ao salvar uma questão **já respondida** (card 27).
 *
 * ⚠️ **Não aparece para questão que ninguém respondeu.** Ali não há escolha a
 * fazer: edita direto, sem cerimônia. O modal só existe quando há quem tenha
 * respondido — e é o chamador que decide, porque é ele que tem o contador.
 *
 * ⚠️ **A pergunta é sobre a PROVA, não sobre "versão".** Pergunta conceitual no
 * momento do save é clicada no automático; o que decide é a consequência.
 *
 * ⚠️ **Duplicar NÃO está aqui.** Duplicar não nasce de estar editando — nasce
 * de "quero outra questão baseada nesta", e a pessoa nem abriu o editor. Fica
 * no botão à parte do card 25.
 */
export function ModalEscolhaAoSalvar({
  isOpen,
  onClose,
  campos,
  respostas,
  provas,
  antes,
  depois,
  onConfirmar,
  permiteNovaVersao = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Os rótulos do que mudou — "enunciado", "alternativa C"… */
  campos: string[];
  /** Quantas respostas a questão já tem. */
  respostas: number;
  /** As provas em que ela está, com `receberNovasVersoes` (card 10). */
  provas: ProvaDaQuestao[];
  antes: Record<string, unknown>;
  depois: Record<string, unknown>;
  onConfirmar: (escolha: EscolhaDeEdicao) => void;
  /** `false` quando a questão já teve versão nova (tickets/023, card 18). */
  permiteNovaVersao?: boolean;
}) {
  /*
    ⚠️ **A heurística escolhe o DEFAULT, a pessoa decide.** Sem ela o default
    vira hábito — e o hábito vai ser o botão da esquerda, sempre. O sistema usa
    o que ele sabe (o diff); a pessoa decide o que só ela sabe (o significado).
  */
  const [escolha, setEscolha] = useState<EscolhaDeEdicao>(() =>
    permiteNovaVersao ? escolhaSugerida(antes, depois) : "correcao",
  );

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        size="md"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{TITULO}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div data-escolha-ao-salvar className="flex flex-col gap-4">
            {/*
          ⚠️ **O diff vem primeiro.** A pergunta abstrata vira concreta quando
          ela chega com o que mudou — e é o que sustenta o default proposto.
        */}
            <p
              data-campos-alterados
              className="text-body text-muted-foreground"
            >
              Você alterou: <strong>{campos.join(" · ")}</strong>
            </p>

            <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3">
              <input
                type="radio"
                name="escolha"
                data-opcao="correcao"
                className="mt-1"
                checked={escolha === "correcao"}
                onChange={() => setEscolha("correcao")}
              />
              <span className="text-body">
                <strong className="block">Correção</strong>
                {textoDaCorrecao(respostas)}
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3">
              <input
                type="radio"
                name="escolha"
                data-opcao="novaVersao"
                className="mt-1"
                checked={escolha === "novaVersao"}
                disabled={!permiteNovaVersao}
                onChange={() => setEscolha("novaVersao")}
              />
              <span className="text-body">
                <strong className="block">Nova versão</strong>
                {permiteNovaVersao ? (
                  <>
                    {textoDaNovaVersao(provas)}
                    <ProvasDosDoisGrupos provas={provas} />
                  </>
                ) : (
                  TEXTO_SEM_NOVA_VERSAO
                )}
              </span>
            </label>
          </div>
        </DialogBody>
        <DialogFooter>
          {/*
          ⚠️ **"Cancelar" não é uma terceira opção visualmente igual às outras
          duas.** Sair sem salvar é outra categoria de ação, e dar a ele o
          mesmo peso faria a pessoa escolher entre três coisas quando são duas.
        */}
          <Button type="button" variant="ghost" data-cancelar onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            data-confirmar
            onClick={() => onConfirmar(escolha)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** A lista com os nomes, sob demanda (tickets/023, card 10). */
function ProvasDosDoisGrupos({ provas }: { provas: ProvaDaQuestao[] }) {
  const { recebem, mantem } = separarProvas(provas);
  if (recebem.length + mantem.length === 0) return null;
  return (
    <details
      data-provas-da-versao
      className="mt-2 text-caption text-muted-foreground"
    >
      <summary className="cursor-pointer">Ver as provas</summary>
      {recebem.length > 0 && (
        <p className="mt-1">
          <strong>Passam a usar a nova:</strong> {recebem.join(", ")}
        </p>
      )}
      {mantem.length > 0 && (
        <p className="mt-1">
          <strong>Continuam com esta (versões fixas):</strong>{" "}
          {mantem.join(", ")}
        </p>
      )}
    </details>
  );
}
