import { useMemo, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "../../../../components/molecules/button";
import { ICategoria } from "../../../../dtos/categoria/categoria";
import { useToastAsync } from "../../../../hooks/useToastAsync";
import {
  createCategoria,
  CreateCategoriaInput,
} from "../../../../services/categoria/createCategoria";
import { gerarNomePreview } from "./nomePreview";

export interface ExameOption {
  value: string;
  label: string;
}

/**
 * ⚠️ Contrato próprio em vez de `typeof createCategoria`. O serviço do admin
 * não conhece `nome` (o backend gera pelo pattern) e o do cursinho o exige;
 * com `strictFunctionTypes` nenhuma das duas assinaturas concretas serve de
 * contrato para a outra. O denominador comum é o que o formulário sabe montar.
 */
export interface CriarCategoriaInput extends CreateCategoriaInput {
  nome?: string;
}

export type CriarCategoriaService = (
  input: CriarCategoriaInput,
  token: string,
) => Promise<ICategoria>;

interface CreateFormProps {
  exameOptions: ExameOption[];
  token: string;
  onCreated: (categoria: ICategoria) => void;
  onCancel: () => void;
  criarService?: CriarCategoriaService;
  /**
   * ⚠️ Nome livre em vez de prefixo + pattern.
   *
   * O backend só dispensa o pattern para categoria de cursinho
   * (`validarPatternNome` retorna cedo quando `dono !== 'system'`). Ligar isto
   * na tela do admin produziria 400 no envio, com o formulário sem nada que
   * explicasse por quê.
   */
  nomeLivre?: boolean;
}

function CreateForm({
  exameOptions,
  token,
  onCreated,
  onCancel,
  criarService,
  nomeLivre = false,
}: CreateFormProps) {
  const criar = criarService ?? createCategoria;
  const execute = useToastAsync();

  const [exame, setExame] = useState("");
  const [duracao, setDuracao] = useState<number | "">("");
  const [semAlvo, setSemAlvo] = useState(false);
  const [quantidade, setQuantidade] = useState<number | "">("");
  const [prefixo, setPrefixo] = useState("");
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  const quantidadeAplicada: number | null = semAlvo
    ? null
    : quantidade === ""
      ? null
      : quantidade;

  const preview = useMemo(
    () =>
      gerarNomePreview(
        prefixo,
        quantidadeAplicada,
        duracao === "" ? null : duracao,
      ),
    [prefixo, quantidadeAplicada, duracao],
  );

  const nomeInformado = !nomeLivre || nome.trim() !== "";
  const valido =
    nomeInformado && exame !== "" && duracao !== "" && Number(duracao) > 0;

  const handleSalvar = async () => {
    if (!valido) return;
    const input: CriarCategoriaInput = {
      exame,
      duracao: Number(duracao),
      quantidadeTotalQuestao: quantidadeAplicada,
    };
    /**
     * ⚠️ `nome` e `prefixo` são mutuamente exclusivos no corpo. Mandando os
     * dois, o backend resolve `dto.nome ?? gerarNomeAuto(dto)`: o nome vence, o
     * prefixo vira peso morto e quem lê o código depois não sabe qual manda.
     */
    if (nomeLivre) {
      input.nome = nome.trim();
    } else if (prefixo.trim()) {
      input.prefixo = prefixo.trim();
    }

    setSalvando(true);
    await execute({
      action: () => criar(input, token),
      loadingMessage: "Criando categoria...",
      successMessage: "Categoria criada",
      errorMessage: (err: Error) => err.message,
      onSuccess: (categoria) => onCreated(categoria),
      onFinally: () => setSalvando(false),
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Voltar
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          Nova Categoria personalizada
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Exame *
          <select
            value={exame}
            onChange={(e) => setExame(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Selecione um exame</option>
            {exameOptions.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Duração (min) *
          <input
            type="number"
            min={1}
            value={duracao}
            onChange={(e) =>
              setDuracao(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Qtd de questões
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={semAlvo ? "" : quantidade}
              disabled={semAlvo}
              onChange={(e) =>
                setQuantidade(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
            />
            <label className="flex cursor-pointer items-center gap-2 font-normal">
              <input
                type="checkbox"
                checked={semAlvo}
                onChange={(e) => setSemAlvo(e.target.checked)}
                className="h-4 w-4 accent-marine"
              />
              sem alvo / livre
            </label>
          </div>
        </div>

        {nomeLivre ? (
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Nome *
            <input
              type="text"
              value={nome}
              placeholder="Ex.: Enem Dia 1"
              onChange={(e) => setNome(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Prefixo (opcional)
              <input
                type="text"
                value={prefixo}
                placeholder="Personalizado"
                onChange={(e) => setPrefixo(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </label>

            <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
              Preview do nome:{" "}
              <span className="font-semibold text-gray-900">{preview}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button typeStyle="refused" size="small" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          typeStyle="primary"
          size="small"
          disabled={!valido || salvando}
          onClick={handleSalvar}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
}

export default CreateForm;
