import { getPhotoCollaborator } from "@/services/prepCourse/collaborator/get-photo";
import {
  ExMembro,
  getExMembros,
  PaginaDeExMembros,
} from "@/services/prepCourse/collaborator/get-ex-membros";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

/** Itens por página — a lista é só leitura e cabe numa tela. */
export const POR_PAGINA = 20;

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

/**
 * Ex-membros do cursinho (tickets/040, card 07): quem foi excluído e não
 * voltou. Só leitura; sem email nem telefone (a pessoa saiu do cursinho).
 */
export function ListaDeExMembros() {
  const {
    data: { token },
  } = useAuthStore();
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState<PaginaDeExMembros | null>(null);
  const [erro, setErro] = useState(false);
  const [fotos, setFotos] = useState<Record<string, string>>({});

  useEffect(() => {
    setErro(false);
    getExMembros(token, pagina, POR_PAGINA)
      .then(setResultado)
      .catch(() => setErro(true));
  }, [token, pagina]);

  // Foto é best-effort: sem ela fica a inicial.
  useEffect(() => {
    const urls: string[] = [];
    for (const m of resultado?.data ?? []) {
      if (!m.foto || fotos[m.foto]) continue;
      const chave = m.foto;
      getPhotoCollaborator(chave)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          urls.push(url);
          setFotos((prev) => ({ ...prev, [chave]: url }));
        })
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado]);

  if (erro) {
    return (
      <p className="px-4 text-sm text-red-600">
        Não foi possível carregar os ex-membros.
      </p>
    );
  }
  if (!resultado) {
    return <p className="px-4 text-sm text-gray-500">Carregando...</p>;
  }
  if (resultado.totalItems === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-gray-500">
        Nenhum ex-membro. Quem for excluído da lista de colaboradores aparece
        aqui.
      </p>
    );
  }

  const paginas = Math.max(1, Math.ceil(resultado.totalItems / POR_PAGINA));
  return (
    <div className="flex flex-col gap-3 px-4">
      <p className="text-xs text-gray-500">
        {resultado.totalItems} ex-membro{resultado.totalItems === 1 ? "" : "s"}
      </p>
      <ul className="flex flex-col gap-2">
        {resultado.data.map((m) => (
          <ItemDeExMembro
            key={m.id}
            membro={m}
            foto={m.foto ? fotos[m.foto] : undefined}
          />
        ))}
      </ul>
      {paginas > 1 && (
        <nav
          aria-label="Páginas de ex-membros"
          className="flex items-center justify-center gap-3 text-sm"
        >
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
            className="rounded-md px-3 py-1 text-marine disabled:text-gray-300"
          >
            Anterior
          </button>
          <span className="tabular-nums text-gray-600">
            {pagina} de {paginas}
          </span>
          <button
            type="button"
            disabled={pagina === paginas}
            onClick={() => setPagina((p) => p + 1)}
            className="rounded-md px-3 py-1 text-marine disabled:text-gray-300"
          >
            Próxima
          </button>
        </nav>
      )}
    </div>
  );
}

function ItemDeExMembro({ membro, foto }: { membro: ExMembro; foto?: string }) {
  return (
    <li className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {foto ? (
        <img
          src={foto}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-marine">
          {membro.nome.charAt(0)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-marine">{membro.nome}</p>
        <p className="text-xs text-gray-500">
          {data(membro.entrada)} → {data(membro.saida)}
          {membro.excluidoPor && ` · excluído por ${membro.excluidoPor}`}
        </p>
        <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
          <div className="flex gap-1">
            <dt>Função que tinha:</dt>
            <dd className="font-medium">{membro.funcaoQueTinha ?? "—"}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Perfil depois da saída:</dt>
            <dd className="font-medium">{membro.funcaoDada ?? "—"}</dd>
          </div>
        </dl>
      </div>
    </li>
  );
}
