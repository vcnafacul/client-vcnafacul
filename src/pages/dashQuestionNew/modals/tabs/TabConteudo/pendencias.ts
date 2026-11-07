import { ValidationError } from "yup";
import { conteudoSchema } from "./schema";

/** As abas do modal onde mora cada campo do conteúdo (ids do `ModalTabTemplateQuestion`). */
export type AbaDoConteudo = "conteudo" | "alternativas";

/** Rótulo e aba de cada campo, na ordem em que aparecem na tela. */
const CAMPOS: Record<string, { rotulo: string; aba: AbaDoConteudo }> = {
  textoQuestao: { rotulo: "Texto da questão", aba: "conteudo" },
  pergunta: { rotulo: "Pergunta", aba: "conteudo" },
  textoAlternativaA: { rotulo: "Alternativa A", aba: "alternativas" },
  textoAlternativaB: { rotulo: "Alternativa B", aba: "alternativas" },
  textoAlternativaC: { rotulo: "Alternativa C", aba: "alternativas" },
  textoAlternativaD: { rotulo: "Alternativa D", aba: "alternativas" },
  textoAlternativaE: { rotulo: "Alternativa E", aba: "alternativas" },
  alternativa: { rotulo: "Alternativa correta", aba: "alternativas" },
};
const ORDEM = Object.keys(CAMPOS);

export const ROTULO_DA_ABA: Record<AbaDoConteudo, string> = {
  conteudo: "Enunciado",
  alternativas: "Alternativas",
};

export interface Pendencia {
  campo: string;
  rotulo: string;
  aba: AbaDoConteudo;
  mensagem: string;
}

/** O id do bloco do campo na tela, para o "Ir" rolar até ele. */
export const ancoraDoCampo = (campo: string) => `campo-conteudo-${campo}`;

/**
 * O que impede salvar o conteúdo, campo a campo.
 *
 * ⚠️ **Pelo schema, e não pelo `errors` do react-hook-form.** Com
 * `mode: "onChange"`, o `errors` só tem os campos em que a pessoa mexeu,
 * enquanto o `isValid` olha o schema inteiro: numa questão antiga com
 * alternativa vazia, o Salvar travava e a lista de erros vinha vazia.
 */
export function pendenciasDoConteudo(valores: unknown): Pendencia[] {
  try {
    conteudoSchema.validateSync(valores, { abortEarly: false });
    return [];
  } catch (erro) {
    if (!(erro instanceof ValidationError)) throw erro;
    const porCampo = new Map<string, string>();
    for (const e of erro.inner.length ? erro.inner : [erro]) {
      if (e.path && CAMPOS[e.path] && !porCampo.has(e.path)) {
        porCampo.set(e.path, e.message);
      }
    }
    return ORDEM.filter((c) => porCampo.has(c)).map((campo) => ({
      campo,
      ...CAMPOS[campo],
      mensagem: porCampo.get(campo)!,
    }));
  }
}
