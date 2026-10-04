import type { CollaboratorColumns } from ".";

/**
 * ⚠️ Sem o `normalize("NFD")`, "joao" não acha "João" — e quem busca raramente
 * digita o acento. Mesma regra de `partnerPrepInscriptionManager/filtros.ts`.
 */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const soDigitos = (texto: string) => texto.replace(/\D/g, "");

/** A partir daqui, dígitos no termo também procuram no telefone. */
const DIGITOS_PARA_TELEFONE = 3;

/**
 * Busca por nome, email, função ou telefone (tickets-documentacao, card 04),
 * a mesma no computador e no celular. O telefone casa pelos dígitos:
 * "(11) 98765" acha "11987654321".
 */
export function buscarColaboradores(
  colaboradores: CollaboratorColumns[],
  busca: string,
): CollaboratorColumns[] {
  const termo = normalizar(busca);
  if (!termo) return colaboradores;
  const digitos = soDigitos(busca);
  return colaboradores.filter((c) => {
    const texto = normalizar(`${c.name} ${c.email} ${c.role?.name ?? ""}`);
    if (texto.includes(termo)) return true;
    return (
      digitos.length >= DIGITOS_PARA_TELEFONE &&
      soDigitos(c.phone ?? "").includes(digitos)
    );
  });
}
