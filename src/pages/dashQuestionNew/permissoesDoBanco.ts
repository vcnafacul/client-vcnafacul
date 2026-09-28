import { Roles } from "@/enums/roles/roles";

/**
 * Quem faz o quê no banco de questões — as mesmas listas das rotas da api
 * (tickets/023, cards 01 e 08). Projeto: `visualizar`/`criar`/`validarQuestao`.
 * Cursinho: `visualizarQuestoesCursinho` e `editarQuestoesCursinho`.
 *
 * ⚠️ Só abre ou esconde a tela. Quem decide se a pessoa pode mexer NUMA prova
 * é o ms, que manda `podeComporProva` em cada prova.
 */
type Permissoes = Record<string, boolean | undefined> | undefined;

/** Entrar no banco (rota, menu). */
export const podeVerBanco = (p: Permissoes) =>
  !!(
    p?.[Roles.visualizarQuestao] ||
    p?.[Roles.visualizarQuestoesCursinho] ||
    p?.[Roles.editarQuestoesCursinho] ||
    p?.[Roles.validarQuestoesCursinho]
  );

/**
 * Aprovar/recusar (tickets/024). Da plataforma (`validarQuestao`) ou do
 * cursinho (`validarQuestoesCursinho`) — o ms decide o que cada um pode.
 */
export const podeValidar = (p: Permissoes) =>
  !!(p?.[Roles.validarQuestao] || p?.[Roles.validarQuestoesCursinho]);

/** Valida como a plataforma: reverte recusa, recusa questão de qualquer prova. */
export const validaComoPlataforma = (p: Permissoes) =>
  !!p?.[Roles.validarQuestao];

/** Criar e editar questão (conteúdo, classificação, imagens). */
export const podeEditarQuestao = (p: Permissoes) =>
  !!(
    p?.[Roles.criarQuestao] ||
    p?.[Roles.validarQuestao] ||
    p?.[Roles.editarQuestoesCursinho]
  );

/** Duplicar e nova versão — na api, `criarQuestao` ou o editor do cursinho. */
export const podeCriarAPartir = (p: Permissoes) =>
  !!(p?.[Roles.criarQuestao] || p?.[Roles.editarQuestoesCursinho]);
