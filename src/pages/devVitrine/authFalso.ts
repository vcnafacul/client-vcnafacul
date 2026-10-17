import { AuthProps, Gender, useAuthStore } from "@/store/auth";
import { tokenIsExpired } from "@/utils/tokenIsExpired";

/** JWT sem assinatura, só para o `fetchWrapper` não tentar renovar (ele só lê o `exp`). */
function tokenFalso() {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  return `${b64({ alg: "none", typ: "JWT" })}.${b64({ exp, vitrine: true })}.vitrine`;
}

const USUARIO_FALSO: AuthProps["user"] = {
  firstName: "Vitrine",
  lastName: "Dev",
  email: "vitrine@dev.local",
  gender: Gender.Other,
  birthday: "2000-01-01",
  phone: "",
  state: "SP",
  city: "São Paulo",
  lgpd: true,
  about: "",
  useSocialName: false,
};

/**
 * Sem sessão válida, entra um usuário falso para os componentes que leem o token
 * do store. Devolve a função que devolve o que havia antes.
 *
 * ⚠️ O store é persistido (`auth-storage`): fechar a aba com a vitrine aberta deixa
 * o usuário falso salvo — basta entrar de novo. Com sessão válida, nada muda.
 */
export function ligarAuthFalso() {
  const { data, doAuth } = useAuthStore.getState();
  let valido = false;
  try {
    valido = !!data.token && !tokenIsExpired(data.token);
  } catch {
    valido = false;
  }
  if (valido) return () => {};

  doAuth({ user: USUARIO_FALSO, token: tokenFalso(), permissao: {}, profiles: [] });
  return () => useAuthStore.getState().doAuth(data);
}
