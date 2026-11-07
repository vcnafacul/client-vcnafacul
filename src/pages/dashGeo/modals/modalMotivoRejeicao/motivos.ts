/** Os motivos da api (`MotivoRejeicaoGeo`). */
export enum MotivoRejeicaoGeo {
  JaCadastrado = "JA_CADASTRADO",
  InformacaoInsuficiente = "INFORMACAO_INSUFICIENTE",
  NaoECursinhoPopular = "NAO_E_CURSINHO_POPULAR",
  Outro = "OUTRO",
}

export const MOTIVOS_DE_REJEICAO = [
  { valor: MotivoRejeicaoGeo.JaCadastrado, rotulo: "Cursinho já cadastrado" },
  {
    valor: MotivoRejeicaoGeo.InformacaoInsuficiente,
    rotulo: "Informação insuficiente para checagem",
  },
  {
    valor: MotivoRejeicaoGeo.NaoECursinhoPopular,
    rotulo: "Não é um cursinho popular",
  },
  { valor: MotivoRejeicaoGeo.Outro, rotulo: "Outro" },
];
