/**
 * Respostas falsas para a vitrine (tickets/041, card 04) — só existe em dev.
 *
 * O componente de verdade chama os serviços de verdade (`fetchWrapper` → `fetch`);
 * aqui o `fetch` da janela é trocado uma vez por um que, enquanto houver um estado
 * da vitrine montado, responde pelas rotas falsas dele. Sem estado montado, passa
 * direto para o `fetch` original.
 */

export type RespostaFalsa = {
  status?: number;
  corpo?: unknown;
  /** Atraso em ms; `Infinity` deixa a requisição pendurada (estado "carregando"). */
  atraso?: number;
};

export type RotaFalsa = {
  metodo?: string;
  /** Casa com o caminho da URL (sem a origem), ex.: `/class/x/attendance-record`. */
  caminho: RegExp;
  resposta: RespostaFalsa | ((url: URL, init?: RequestInit) => RespostaFalsa);
};

const API = new URL(import.meta.env.VITE_BASE_URL ?? "http://localhost:3333", window.location.origin)
  .origin;

let rotasAtuais: RotaFalsa[] | null = null;
let fetchOriginal: typeof fetch | null = null;

function responder({ status = 200, corpo = {}, atraso = 0 }: RespostaFalsa) {
  const resposta = () =>
    new Response(JSON.stringify(corpo), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  if (atraso === Infinity) return new Promise<Response>(() => {});
  if (atraso > 0)
    return new Promise<Response>((r) => setTimeout(() => r(resposta()), atraso));
  return Promise.resolve(resposta());
}

function fetchDaVitrine(input: RequestInfo | URL, init?: RequestInit) {
  if (!rotasAtuais) return fetchOriginal!(input, init);

  const url = new URL(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
    window.location.origin,
  );
  const metodo = (init?.method ?? "GET").toUpperCase();
  // Fora da api (Firebase do chat, Maps…) segue normal.
  if (url.origin !== API) return fetchOriginal!(input, init);

  const rota = rotasAtuais.find(
    (r) => (r.metodo ?? "GET").toUpperCase() === metodo && r.caminho.test(url.pathname),
  );
  if (rota) {
    return responder(
      typeof rota.resposta === "function" ? rota.resposta(url, init) : rota.resposta,
    );
  }
  /*
    ⚠️ Sem rota falsa não vai para a api: a vitrine não pode gravar nada de
    verdade (o "Confirmar" da chamada criaria um registro).
  */
  console.warn(`[vitrine] ${metodo} ${url.pathname} sem resposta falsa — respondendo 501`);
  return responder({ status: 501, corpo: { message: "vitrine: rota sem resposta falsa" } });
}

/** Liga as rotas de um estado. Devolve a função que desliga. */
export function ligarFetchFalso(rotas: RotaFalsa[]) {
  if (!fetchOriginal) {
    fetchOriginal = window.fetch.bind(window);
    window.fetch = fetchDaVitrine as typeof fetch;
  }
  rotasAtuais = rotas;
  return () => {
    if (rotasAtuais === rotas) rotasAtuais = null;
  };
}
