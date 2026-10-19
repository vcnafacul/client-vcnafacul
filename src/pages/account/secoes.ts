/** As seções do Meu perfil (2026-10-19): menu à esquerda, abas no celular. */
export type SecaoDoPerfil = "dados" | "frentes" | "notificacoes";

export const ROTULO_DA_SECAO: Record<SecaoDoPerfil, string> = {
  dados: "Dados pessoais",
  frentes: "Frentes de afinidade",
  notificacoes: "Notificações",
};

/** Estudante não tem foto nem frentes: só dados e notificações. */
export function secoesDoPerfil(ehColaborador: boolean): SecaoDoPerfil[] {
  return ehColaborador
    ? ["dados", "frentes", "notificacoes"]
    : ["dados", "notificacoes"];
}

/** `?secao=` da URL, se for uma seção que a pessoa tem; senão, dados. */
export function secaoDaUrl(
  valor: string | null,
  disponiveis: SecaoDoPerfil[],
): SecaoDoPerfil {
  return disponiveis.includes(valor as SecaoDoPerfil)
    ? (valor as SecaoDoPerfil)
    : "dados";
}
