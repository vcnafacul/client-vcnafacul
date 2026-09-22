/**
 * De que recorte é o relatório aberto.
 *
 * ⚠️ **Arquivo próprio**, no padrão de `percentuais.ts`, `statusDaLinha.ts` e
 * `segmentosDaBarra.ts`: o `react-refresh/only-export-components` reprova
 * constante exportada ao lado de componente, e o lint deste repo roda com zero
 * warnings.
 */
export type RecorteDoRelatorio = "turma" | "cursinho";

/**
 * O cabeçalho da coluna de dificuldade no modal do estudante.
 *
 * ⚠️ **O rótulo era fixo em "Acertos na turma", e mentia no caminho mais
 * comum.** O agregado vem do MESMO recorte do relatório aberto (`simuladoId` +
 * `turmaId`): com `?turma=` o percentual é da turma, **sem ele é do cursinho
 * inteiro** — que é justamente como o `dashProvas` abre a tela. Quem lia "na
 * turma" ali concluía que estava vendo um recorte que não pediu.
 *
 * ⚠️ **Dinâmico, e não um rótulo neutro** ("% de acerto", "Acertos gerais"):
 * neutro troca a mentira por vaguidão, e o número **nunca** é geral — é sempre
 * de um recorte. Dizer qual é o que deixa o coordenador julgar a amostra, pelo
 * mesmo motivo de a base ("de 20") andar junto na célula.
 */
export const ROTULO_DA_DIFICULDADE: Record<RecorteDoRelatorio, string> = {
  turma: "Acertos na turma",
  cursinho: "Acertos no cursinho",
};
