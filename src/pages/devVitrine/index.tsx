import { DEV_VITRINE } from "@/routes/path";
import { useLayoutEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ligarAuthFalso } from "./authFalso";
import { ligarFetchFalso } from "./fetchFalso";
import { EstadoDaVitrine } from "./tipos";
import { vitrines } from "./vitrines";

/**
 * Vitrine de componentes (tickets/041, card 04) — **só em dev**: a rota nem
 * existe no build (`import.meta.env.DEV` no `PlatformRoutes`).
 *
 * `/dev/vitrine` lista; `/dev/vitrine/<componente>/<estado>` monta o componente
 * de verdade com respostas falsas da api, para ver (e tirar print) sem login,
 * sem banco e em qualquer tamanho de tela.
 */
export default function DevVitrine() {
  const { componente, estado } = useParams();
  const vitrine = vitrines.find((v) => v.slug === componente);

  if (!vitrine) return <Indice />;

  const atual = vitrine.estados.find((e) => e.slug === estado) ?? vitrine.estados[0];

  return (
    <div className="min-h-dvh bg-gray-100">
      <nav
        data-vitrine-barra
        className="sticky top-0 z-0 flex flex-wrap items-center gap-2 border-b bg-white px-4 py-2 text-sm"
      >
        <Link to={DEV_VITRINE} className="font-bold text-marine">
          Vitrine
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-semibold">{vitrine.titulo}</span>
        <code className="hidden text-xs text-gray-500 sm:inline">{vitrine.arquivo}</code>
        <span className="flex-1" />
        {vitrine.estados.map((e) => (
          <Link
            key={e.slug}
            to={`${DEV_VITRINE}/${vitrine.slug}/${e.slug}`}
            className={`rounded px-2 py-1 ${e.slug === atual.slug ? "bg-marine text-white" : "bg-gray-100"}`}
          >
            {e.titulo}
          </Link>
        ))}
      </nav>
      <main className="p-4">
        {/* `key`: trocar de estado remonta o componente com as rotas novas. */}
        <Bancada key={`${vitrine.slug}/${atual.slug}`} estado={atual} />
      </main>
    </div>
  );
}

/**
 * Liga as respostas falsas e o usuário falso **antes** de montar o componente:
 * os efeitos dos filhos rodam antes dos do pai, então montar junto deixaria a
 * primeira requisição escapar para a api.
 */
function Bancada({ estado }: { estado: EstadoDaVitrine }) {
  const [pronto, setPronto] = useState(false);

  useLayoutEffect(() => {
    const desligarFetch = ligarFetchFalso(estado.rotas ?? []);
    const desligarAuth = ligarAuthFalso();
    setPronto(true);
    return () => {
      desligarFetch();
      desligarAuth();
    };
  }, [estado]);

  return pronto ? <>{estado.render()}</> : null;
}

function Indice() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 text-2xl font-bold text-marine">Vitrine de componentes</h1>
      <p className="mb-6 text-sm text-gray-500">
        Só em dev. Cada estado monta o componente real com respostas falsas da api.
      </p>
      <ul className="flex flex-col gap-4">
        {vitrines.map((v) => (
          <li key={v.slug} className="rounded-md border bg-white p-4">
            <p className="font-semibold">{v.titulo}</p>
            <code className="text-xs text-gray-500">{v.arquivo}</code>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {v.estados.map((e) => (
                <Link
                  key={e.slug}
                  to={`${DEV_VITRINE}/${v.slug}/${e.slug}`}
                  className="rounded bg-gray-100 px-2 py-1 hover:bg-gray-200"
                >
                  {e.titulo}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
