import ModalTemplate from "@/components/templates/modalTemplate";
import { useState } from "react";
import {
  escolhaSugerida,
  textoDaCorrecao,
  textoDaNovaVersao,
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
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Os rótulos do que mudou — "enunciado", "alternativa C"… */
  campos: string[];
  /** Quantas respostas a questão já tem. */
  respostas: number;
  /** Em quantas provas ela está. */
  provas: number;
  antes: Record<string, unknown>;
  depois: Record<string, unknown>;
  onConfirmar: (escolha: EscolhaDeEdicao) => void;
}) {
  /*
    ⚠️ **A heurística escolhe o DEFAULT, a pessoa decide.** Sem ela o default
    vira hábito — e o hábito vai ser o botão da esquerda, sempre. O sistema usa
    o que ele sabe (o diff); a pessoa decide o que só ela sabe (o significado).
  */
  const [escolha, setEscolha] = useState<EscolhaDeEdicao>(() =>
    escolhaSugerida(antes, depois),
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={onClose}
      className="w-full max-w-lg rounded-lg bg-white p-4 shadow-xl"
    >
      <div data-escolha-ao-salvar className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{TITULO}</h2>

        {/*
          ⚠️ **O diff vem primeiro.** A pergunta abstrata vira concreta quando
          ela chega com o que mudou — e é o que sustenta o default proposto.
        */}
        <p data-campos-alterados className="text-sm text-gray-600">
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
          <span className="text-sm">
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
            onChange={() => setEscolha("novaVersao")}
          />
          <span className="text-sm">
            <strong className="block">Nova versão</strong>
            {textoDaNovaVersao(provas)}
          </span>
        </label>

        <div className="flex items-center justify-end gap-3">
          {/*
            ⚠️ **"Cancelar" não é uma terceira opção visualmente igual às outras
            duas.** Sair sem salvar é outra categoria de ação, e dar a ele o
            mesmo peso faria a pessoa escolher entre três coisas quando são duas.
          */}
          <button
            type="button"
            data-cancelar
            onClick={onClose}
            className="text-sm text-gray-600 underline underline-offset-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-confirmar
            onClick={() => onConfirmar(escolha)}
            className="rounded-md bg-orange px-4 py-2 text-sm text-white"
          >
            Salvar
          </button>
        </div>
      </div>
    </ModalTemplate>
  );
}
