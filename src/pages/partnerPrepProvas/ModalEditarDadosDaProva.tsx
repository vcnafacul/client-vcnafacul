import { useState } from "react";
import { toast } from "react-toastify";
import ModalTemplate from "@/components/templates/modalTemplate";
import { ICategoria } from "@/dtos/categoria/categoria";
import { Prova } from "@/dtos/prova/prova";
import {
  DadosDaProva,
  editarDadosProvaCursinho,
} from "@/services/prova/editarDadosProvaCursinho";

/** Os valores que a api aceita — o rótulo da PPL é outro. */
const EDICOES = [
  { valor: "Regular", rotulo: "Regular" },
  { valor: "Digital", rotulo: "Digital" },
  { valor: "Replicacao", rotulo: "Reaplicação/PPL" },
];
const valorDaEdicao = (edicao: string) =>
  EDICOES.find((e) => e.valor === edicao || e.rotulo === edicao)?.valor ??
  "Regular";

export const TEXTO_AVISO_CATEGORIA =
  "A categoria só pode ser trocada antes de gerar o cartão-resposta e de qualquer envio de cartão.";

type Props = {
  prova: Prova;
  /** As categorias DO CURSINHO; `undefined` enquanto carregam. */
  categorias?: ICategoria[];
  token: string;
  isOpen: boolean;
  handleClose: () => void;
  onSalva: (atualizada: Prova) => void;
};

/**
 * Card 41 — corrigir nome, ano, edição, aplicação e categoria da prova do
 * cursinho. Manda só o que mudou: trocar o ano não precisa passar pela regra
 * da categoria.
 *
 * ⚠️ A lista traz a categoria pelo NOME (achatada pelo backend); o id sai das
 * categorias do cursinho, onde o nome é único por cursinho.
 */
export function ModalEditarDadosDaProva({
  prova,
  categorias,
  token,
  isOpen,
  handleClose,
  onSalva,
}: Props) {
  const selecionaveis = (categorias ?? []).filter((c) => c.selecionavel);
  const categoriaAtual =
    selecionaveis.find((c) => c.nome === prova.categoria)?._id ?? "";

  const [nome, setNome] = useState(prova.nome);
  const [ano, setAno] = useState(String(prova.ano));
  const [edicao, setEdicao] = useState(valorDaEdicao(prova.edicao));
  const [aplicacao, setAplicacao] = useState(String(prova.aplicacao || 1));
  const [categoria, setCategoria] = useState(categoriaAtual);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("A prova precisa de um nome.");
      return;
    }
    const dados: DadosDaProva = {};
    if (nome.trim() !== prova.nome) dados.nome = nome.trim();
    if (Number(ano) !== prova.ano) dados.ano = Number(ano);
    if (edicao !== valorDaEdicao(prova.edicao)) dados.edicao = edicao;
    if (Number(aplicacao) !== prova.aplicacao)
      dados.aplicacao = Number(aplicacao);
    if (categoria && categoria !== categoriaAtual) dados.categoria = categoria;
    if (!Object.keys(dados).length) {
      handleClose();
      return;
    }

    setSalvando(true);
    try {
      const r = await editarDadosProvaCursinho(prova._id, dados, token);
      const nova = selecionaveis.find((c) => c._id === dados.categoria);
      toast.success("Dados da prova atualizados");
      onSalva({
        ...prova,
        nome: r.nome,
        ano: dados.ano ?? prova.ano,
        edicao: (dados.edicao ?? prova.edicao) as Prova["edicao"],
        aplicacao: dados.aplicacao ?? prova.aplicacao,
        ...(nova
          ? {
              categoria: nova.nome,
              totalQuestao: nova.quantidadeTotalQuestao as number,
            }
          : {}),
      });
    } catch (err) {
      // 409 (nome em uso, categoria com cartão) chega com o motivo; o modal fica.
      toast.error(
        err instanceof Error ? err.message : "Erro ao salvar os dados da prova",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-full max-w-lg rounded-lg bg-white shadow-xl p-2"
    >
      <form onSubmit={salvar} className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-marine">Editar dados da prova</h2>
        <div>
          <label htmlFor="prova-nome" className="block text-sm font-semibold mb-1">
            Nome
          </label>
          <input
            id="prova-nome"
            value={nome}
            maxLength={200}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="prova-ano" className="block text-sm font-semibold mb-1">
              Ano
            </label>
            <input
              id="prova-ano"
              type="number"
              min={1990}
              max={2100}
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <label htmlFor="prova-edicao" className="block text-sm font-semibold mb-1">
              Edição
            </label>
            <select
              id="prova-edicao"
              value={edicao}
              onChange={(e) => setEdicao(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              {EDICOES.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="prova-aplicacao"
              className="block text-sm font-semibold mb-1"
            >
              Aplicação
            </label>
            <select
              id="prova-aplicacao"
              value={aplicacao}
              onChange={(e) => setAplicacao(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              {[1, 2, 3].map((n) => (
                <option key={n} value={String(n)}>
                  {n}ª aplicação
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="prova-categoria"
            className="block text-sm font-semibold mb-1"
          >
            Categoria
          </label>
          <select
            id="prova-categoria"
            value={categoria}
            disabled={!categorias}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border rounded-lg p-2 disabled:opacity-60"
          >
            {!categoriaAtual && <option value="">{prova.categoria}</option>}
            {selecionaveis.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nome}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{TEXTO_AVISO_CATEGORIA}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="px-4 py-2 bg-marine text-white rounded-lg disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </ModalTemplate>
  );
}
