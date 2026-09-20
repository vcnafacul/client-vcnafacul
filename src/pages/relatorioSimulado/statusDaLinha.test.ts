import { describe, expect, it } from "vitest";
import { statusDaLinha } from "./statusDaLinha";
import type { LinhaDoRelatorio } from "@/dtos/relatorioSimulado/relatorioSimulado";

const linha = (over: Partial<LinhaDoRelatorio> = {}): LinhaDoRelatorio => ({
  usuario: "u1",
  nome: "Ana Silva",
  matricula: "2025001",
  turmaId: "t-1",
  turmaNome: "Turma A",
  enviouCartao: true,
  status: "completed",
  ...over,
});

describe("statusDaLinha", () => {
  it("quem não enviou cartão tem rótulo próprio, não 'erro'", () => {
    // Não enviar não é falha: é o estado normal de metade da turma antes de a
    // digitalização terminar.
    const { tone, label } = statusDaLinha(linha({ enviouCartao: false, status: undefined }));

    expect(label).toBe("Não enviou");
    expect(tone).toBe("neutral");
  });

  it("enviouCartao manda, mesmo com historicoId presente", () => {
    // a api devolve `enviouCartao` explícito justamente para ninguém inferir
    const { label } = statusDaLinha(
      linha({ enviouCartao: false, historicoId: "h1", status: "completed" }),
    );

    expect(label).toBe("Não enviou");
  });

  it.each([
    ["completed", "Lido", "done"],
    ["failed", "Falhou", "missing"],
    ["awaiting_omr", "Aguardando leitura", "running"],
    ["pending", "Aguardando leitura", "running"],
    ["processing", "Aguardando leitura", "running"],
  ])("status %s vira %s", (status, label, tone) => {
    const r = statusDaLinha(linha({ status: status as never }));

    expect(r.label).toBe(label);
    expect(r.tone).toBe(tone);
  });

  it("status desconhecido não quebra a tela", () => {
    // o ms pode ganhar um status novo antes do client; a linha tem que
    // continuar renderizando
    const r = statusDaLinha(linha({ status: "status_do_futuro" as never }));

    expect(r.label).toBeTruthy();
    expect(r.tone).toBe("neutral");
  });

  it("enviou mas sem status também não quebra", () => {
    const r = statusDaLinha(linha({ status: undefined }));

    expect(r.label).toBeTruthy();
  });
});
