import { describe, expect, it } from "vitest";
import { dashV2 } from "@/components/dashV2";
import {
  STATUS_COMPLETA,
  STATUS_EM_CADASTRO,
  STATUS_EM_VALIDACAO,
  STATUS_SEM_QUESTOES,
  statusDaProva,
} from "./status";

const contagens = (
  totalQuestao: number,
  totalQuestaoCadastradas: number,
  totalQuestaoValidadas: number,
) => ({ totalQuestao, totalQuestaoCadastradas, totalQuestaoValidadas });

describe("statusDaProva", () => {
  it("180 de 180 validadas é Completa, em verde", () => {
    expect(statusDaProva(contagens(180, 180, 180))).toEqual(STATUS_COMPLETA);
    expect(STATUS_COMPLETA.tone).toBe("done");
    expect(STATUS_COMPLETA.label).toBe("Completa");
  });

  it("tudo cadastrado e faltando validar é Em validação", () => {
    expect(statusDaProva(contagens(180, 180, 132))).toEqual(
      STATUS_EM_VALIDACAO,
    );
    expect(STATUS_EM_VALIDACAO.label).toBe("Em validação");
  });

  /**
   * ⚠️ **O ponto do ticket.** No V1 esta prova recebe `StatusEnum.Rejected`, o
   * triângulo vermelho de "recusada" — e ela é só uma prova que ainda está
   * sendo cadastrada. Se este teste voltar a aceitar `missing`, o vermelho
   * volta a aparecer numa tela onde nada é destrutivo.
   */
  it("faltando cadastrar é Em cadastro — e NÃO é vermelho", () => {
    const status = statusDaProva(contagens(180, 90, 40));
    expect(status).toEqual(STATUS_EM_CADASTRO);
    expect(status.label).toBe("Em cadastro");
    expect(status.tone).toBe("running");
    expect(status.tone).not.toBe("missing");
  });

  /**
   * ⚠️ A ordem das condições. Com `totalQuestao === 0` avaliado depois de
   * `validadas >= total`, uma prova vazia satisfaz `0 >= 0` e sai "Completa".
   */
  it("prova sem questão nenhuma é Sem questões, não Completa", () => {
    const status = statusDaProva(contagens(0, 0, 0));
    expect(status).toEqual(STATUS_SEM_QUESTOES);
    expect(status.label).toBe("Sem questões");
    expect(status.tone).toBe("neutral");
    expect(status.label).not.toBe(STATUS_COMPLETA.label);
  });

  it("contagem dessincronizada (cadastradas acima do total) não vira Em cadastro", () => {
    // Resquício de re-upload no banco: 190 cadastradas de 180.
    expect(statusDaProva(contagens(180, 190, 100))).toEqual(
      STATUS_EM_VALIDACAO,
    );
    expect(statusDaProva(contagens(180, 190, 185))).toEqual(STATUS_COMPLETA);
  });

  it("nenhum dos quatro estados desta tela é vermelho", () => {
    const todos = [
      STATUS_SEM_QUESTOES,
      STATUS_EM_CADASTRO,
      STATUS_EM_VALIDACAO,
      STATUS_COMPLETA,
    ];
    for (const s of todos) {
      expect(s.tone, s.label).not.toBe("missing");
      // Cinto e suspensório: nenhum dos tons usados pinta de vermelho.
      expect(JSON.stringify(dashV2.status[s.tone]), s.label).not.toContain(
        "red",
      );
    }
  });

  it("a ordem vai do mais incompleto para o mais completo", () => {
    expect(STATUS_SEM_QUESTOES.ordem).toBeLessThan(STATUS_EM_CADASTRO.ordem);
    expect(STATUS_EM_CADASTRO.ordem).toBeLessThan(STATUS_EM_VALIDACAO.ordem);
    expect(STATUS_EM_VALIDACAO.ordem).toBeLessThan(STATUS_COMPLETA.ordem);
  });
});

describe("os estados intermediários se distinguem por cor", () => {
  /**
   * ⚠️ O motivo de existirem dois tons e não um: "Em cadastro" e "Em validação"
   * saíam os dois em `running`, com o mesmo chip laranja. Só o rótulo separava
   * os dois, e de relance a lista parecia toda igual.
   *
   * ⚠️ **Nenhum deles é `missing`.** Nada nesta tela é destrutivo — é a regra
   * do `status.ts` que não dá para "otimizar" sem desfazer o ticket.
   */
  it("Em cadastro e Em validação têm tons diferentes", () => {
    expect(STATUS_EM_CADASTRO.tone).not.toBe(STATUS_EM_VALIDACAO.tone);
  });

  it("os quatro estados usam quatro tons distintos", () => {
    const tons = [
      STATUS_SEM_QUESTOES.tone,
      STATUS_EM_CADASTRO.tone,
      STATUS_EM_VALIDACAO.tone,
      STATUS_COMPLETA.tone,
    ];
    expect(new Set(tons).size).toBe(4);
  });

  it("nenhum estado é vermelho", () => {
    for (const s of [
      STATUS_SEM_QUESTOES,
      STATUS_EM_CADASTRO,
      STATUS_EM_VALIDACAO,
      STATUS_COMPLETA,
    ]) {
      expect(s.tone, s.label).not.toBe("missing");
    }
  });
});
