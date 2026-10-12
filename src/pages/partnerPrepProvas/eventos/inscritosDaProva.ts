import type { EventoDoCursinho } from "@/services/eventoSimulado";

/**
 * "Enem Dia 1: 5 (Inglês 3 · Espanhol 2)" — tickets/039: a prova com mais de um
 * simulado mostra quantos escolheram cada língua. O nome do simulado repete o da
 * prova; aqui vai só o que sobra ("Inglês").
 */
export function inscritosDaProva(p: EventoDoCursinho["provas"][number]): string {
  const total = `${p.nome}: ${p.inscritos}`;
  if (!p.simulados || p.simulados.length < 2) return total;
  const partes = p.simulados.map((s) => {
    const rotulo = s.nome.startsWith(p.nome)
      ? s.nome.slice(p.nome.length).trim() || s.nome
      : s.nome;
    return `${rotulo} ${s.inscritos}`;
  });
  return `${total} (${partes.join(" · ")})`;
}
