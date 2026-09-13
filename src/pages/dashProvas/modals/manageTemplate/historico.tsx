import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../../components/molecules/button";
import { useToastAsync } from "../../../../hooks/useToastAsync";
import { baixarModelo } from "../../../../services/caderno/template/baixarModelo";
import { listarVersoes } from "../../../../services/caderno/template/listarVersoes";
import { restaurar } from "../../../../services/caderno/template/restaurar";
import { VersaoTemplate } from "../../../../services/caderno/template/tipos";
import { formatDate } from "../../../../utils/date";

interface HistoricoProps {
  token: string;
  /** A versão publicada hoje, ou `null` se nunca ninguém publicou. */
  versaoNoAr: number | null;
  /** Restaurou: o modal volta para a aba principal e recarrega o rascunho. */
  onRestaurado: () => void;
  onVoltar: () => void;
}

/**
 * A frase inteira desta aba.
 *
 * ⚠️ **Restaurar não é reverter.** Ele cria um RASCUNHO a partir da versão
 * antiga; a versão publicada continua no ar até alguém publicar esse rascunho.
 * Sem isto escrito aqui, o coordenador clica esperando a v2 voltar ao ar na
 * hora e sai achando que o botão não funcionou — ou pior, que funcionou, e a
 * prova seguinte sai com o template que ele achava que tinha trocado.
 *
 * A tela é o único lugar onde isso pode ser dito: o `restaurar` responde sem
 * corpo, e não há como o servidor avisar depois.
 */
function fraseDaConfirmacao(versao: number, versaoNoAr: number | null) {
  return versaoNoAr === null
    ? `Isto cria um rascunho a partir da v${versao}. Nenhuma versão está publicada hoje, e continua assim até você publicar o rascunho.`
    : `Isto cria um rascunho a partir da v${versao}. A v${versaoNoAr} continua publicada até você publicar o rascunho.`;
}

function Historico({
  token,
  versaoNoAr,
  onRestaurado,
  onVoltar,
}: HistoricoProps) {
  const execute = useToastAsync();

  const [versoes, setVersoes] = useState<VersaoTemplate[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [baixandoVersao, setBaixandoVersao] = useState<number | null>(null);
  /** A versão que está esperando confirmação — `null` quando ninguém clicou. */
  const [aRestaurar, setARestaurar] = useState<VersaoTemplate | null>(null);
  const [restaurando, setRestaurando] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    listarVersoes(token)
      .then((lista) => {
        // ⚠️ O ms devolve TUDO — `versoes()` é um `find().sort()` sem filtro, e
        // o rascunho vem junto. O filtro é aqui de propósito, não é sobra: o
        // rascunho não tem número de versão (o ms grava `0`, um placeholder,
        // porque a versão só é decidida no publicar), ele já aparece na aba
        // principal com o contexto e os botões certos, e um "Restaurar" nele
        // criaria um rascunho a partir dele mesmo — um no-op com cara de ação.
        // Histórico é o que já foi publicado.
        if (ativo) setVersoes(lista.filter((v) => v.status !== "rascunho"));
      })
      .catch((erro: Error) => toast.error(erro.message))
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [token]);

  // ⚠️ Baixar por versão existe para CONFERIR uma versão antes de restaurá-la:
  // o número e as notas não dizem como a capa ficou.
  const handleBaixar = async (versao: number) => {
    if (baixandoVersao !== null) return;
    setBaixandoVersao(versao);
    await execute({
      action: () => baixarModelo({ versao }, token),
      loadingMessage: `Preparando o zip da v${versao}...`,
      successMessage: `Zip da v${versao} baixado.`,
      errorMessage: (err: Error) => err.message,
      onSuccess: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `template-caderno-v${versao}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      onFinally: () => setBaixandoVersao(null),
    });
  };

  const handleRestaurar = async (versao: number) => {
    if (restaurando) return;
    setRestaurando(true);
    await execute({
      action: () => restaurar(versao, token),
      loadingMessage: `Restaurando a v${versao}...`,
      // ⚠️ A mensagem repete o que a confirmação disse, porque é aqui que ele
      // procura o resultado: o rascunho existe, o que está no ar não mudou.
      successMessage: `Rascunho criado a partir da v${versao}. Publique na aba principal para colocá-lo no ar.`,
      errorMessage: (err: Error) => err.message,
      // ⚠️ Só volta para a principal depois que o servidor confirmou. Voltar
      // antes mostraria a aba principal sem o rascunho que ela promete.
      onSuccess: () => {
        setARestaurar(null);
        onRestaurado();
      },
      onFinally: () => setRestaurando(false),
    });
  };

  if (aRestaurar !== null) {
    return (
      <div className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Restaurar a v{aRestaurar.versao}
        </h2>
        <p className="text-sm font-medium text-gray-900">
          {fraseDaConfirmacao(aRestaurar.versao, versaoNoAr)}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Restaurar não é reverter: nada muda para as provas agora. O rascunho
          aparece na aba principal, e é de lá que ele vai ao ar.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            typeStyle="refused"
            size="small"
            disabled={restaurando}
            onClick={() => setARestaurar(null)}
          >
            Cancelar
          </Button>
          <Button
            typeStyle="primary"
            size="small"
            disabled={restaurando}
            onClick={() => handleRestaurar(aRestaurar.versao)}
          >
            Criar rascunho a partir da v{aRestaurar.versao}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">
          Histórico de versões
        </h2>
        <Button typeStyle="quaternary" size="small" onClick={onVoltar}>
          Voltar
        </Button>
      </div>

      {carregando ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : versoes.length === 0 ? (
        <p className="text-sm text-gray-600">
          Nenhuma versão no histórico ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {versoes.map((versao) => (
            <li
              key={versao.versao}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  v{versao.versao}
                  {versao.versao === versaoNoAr && (
                    <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      no ar
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {versao.publicadaEm
                    ? `Publicada em ${formatDate(versao.publicadaEm)}`
                    : "Nunca publicada"}
                  {" — por "}
                  {versao.criadorId}
                </p>
                {versao.notas && (
                  <p className="mt-1 break-words text-sm text-gray-600">
                    {versao.notas}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-3">
                <Button
                  typeStyle="quaternary"
                  size="small"
                  disabled={baixandoVersao !== null}
                  onClick={() => handleBaixar(versao.versao)}
                >
                  Baixar
                </Button>
                <Button
                  typeStyle="secondary"
                  size="small"
                  onClick={() => setARestaurar(versao)}
                >
                  Restaurar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Historico;
