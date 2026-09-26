import { HistoricoDTO } from "../dtos/historico/historicoDTO";

/**
 * Nome e total de questões da categoria do simulado de um histórico.
 *
 * ⚠️ A categoria pode faltar — simulado sem categoria existe, e o ms-simulado
 * já devolveu a lista sem populá-la. Ler `simulado.categoria.nome` direto
 * derrubava a tela de simulado inteira no primeiro card. Sem categoria, o nome
 * cai para o do simulado e o total fica `null` (completude desconhecida).
 */
export function categoriaDoHistorico(historico: HistoricoDTO) {
  const categoria = historico.simulado?.categoria;
  return {
    nome: categoria?.nome ?? historico.simulado?.nome ?? "Simulado",
    totalQuestoes: categoria?.quantidadeTotalQuestao ?? null,
  };
}
