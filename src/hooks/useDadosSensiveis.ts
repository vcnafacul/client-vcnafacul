import {
  mascararCpf,
  mascararEmail,
  mascararRg,
  mascararTelefone,
} from "@/utils/mascaras";
import { useMemo, useState } from "react";

export interface Mascaras {
  cpf: (valor?: string | null) => string;
  rg: (valor?: string | null) => string;
  email: (valor?: string | null) => string;
  telefone: (valor?: string | null) => string;
}

const semMascara = (valor?: string | null) => valor ?? "";

export const SEM_MASCARA: Mascaras = {
  cpf: semMascara,
  rg: semMascara,
  email: semMascara,
  telefone: semMascara,
};

/**
 * Dados sensíveis (CPF, RG, e-mail, telefones) começam ocultos em toda tela.
 * Quem tem permissão de ver o dado completo ganha o toggle para mostrar;
 * a escolha não é guardada: ao voltar à tela, oculta de novo.
 * Quem não tem permissão já recebe o dado mascarado da api.
 */
export function useDadosSensiveis(podeVerCompleto: boolean) {
  const [ocultar, setOcultar] = useState(true);
  const oculto = ocultar || !podeVerCompleto;

  const mascarar = useMemo<Mascaras>(
    () =>
      oculto
        ? {
            cpf: mascararCpf,
            rg: mascararRg,
            email: mascararEmail,
            telefone: mascararTelefone,
          }
        : SEM_MASCARA,
    [oculto],
  );

  return {
    mostrarToggle: podeVerCompleto,
    ocultar: oculto,
    setOcultar,
    mascarar,
  };
}
