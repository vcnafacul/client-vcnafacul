/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashListTemplate, type DashAction } from "@/components/dashV2";
import { FilterProps } from "@/components/atoms/filter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SelectProps } from "../../components/atoms/select";
import { CardDash } from "../../components/molecules/cardDash";
import { DashCardContext } from "../../context/dashCardContext";
import { News } from "../../dtos/news/news";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { createNews } from "../../services/news/createNews";
import { deleteNews } from "../../services/news/deleteNews";
import { getTodasAsNovidades } from "../../services/news/getAllNews";
import { updateNews, UpdateNewsPayload } from "../../services/news/updateNews";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { getStatusBool } from "../../utils/getStatusIcon";
import { Paginate } from "../../utils/paginate";
import { colunasDeNovidade, ORDENACAO_PADRAO } from "./columns";
import { dashNews } from "./data";
import ModalEditNew from "./modals/modalEditNew";
import { useModals } from "@/hooks/useModal";

function DashNews() {
  const [news, setNews] = useState<News[]>([]);
  const [newSelect, setNewSelect] = useState<News | null>();
  const [status, setStatus] = useState<StatusEnum>(StatusEnum.Approved);
  const [busca, setBusca] = useState("");
  // Três estados do template V2: o erro de busca vira "tentar de novo".
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("loading");
  const limitCards = 100;

  const modals = useModals([
    'modalEdit',
  ]);

  const {
    data: { token },
  } = useAuthStore();

  const cardTransformation = (n: News): CardDash => ({
    id: n.id,
    title: n.title,
    status: getStatusBool(n.actived),
    infos: [
      { field: "Título", value: n.title },
      { field: "Destaque", value: n.destaque ? "Sim" : "Não" },
      {
        field: "Criado em",
        value: n.createdAt ? formatDate(n.createdAt.toString()) : "",
      },
    ],
  });

  const onClickCard = (cardId: number | string) => {
    setNewSelect(news.find((n) => n.id === cardId));
    modals.modalEdit.open();
  };

  const create = (
    title: string,
    options: {
      description?: string;
      destaque: boolean;
      expireAt?: string;
      contentType: 'file' | 'text';
      body?: string;
      file?: File | null;
    }
  ) => {
    const promise =
      options.contentType === 'text'
        ? createNews(
            {
              title,
              contentType: 'text',
              body: options.body!,
              description: options.description,
              destaque: options.destaque,
              expire_at: options.expireAt,
            },
            token
          )
        : (() => {
            const fd = new FormData();
            fd.append("title", title);
            fd.append("destaque", String(options.destaque));
            if (options.description) fd.append("description", options.description);
            fd.append("file", options.file as File, title + ".docx");
            if (options.expireAt) fd.append("expire_at", options.expireAt);
            return createNews(fd, token);
          })();

    promise
      .then((res) => {
        setNews([res, ...news]);
        modals.modalEdit.close();
        toast.success(`Novidade ${res.title} criada com sucesso`, {
          theme: "dark",
        });
      })
      .catch((error: Error) => {
        toast.error(error.message, { theme: "dark" });
      });
  };

  const update = (
    id: string,
    options: {
      title: string;
      description: string | null;
      destaque: boolean;
      expireAt?: string;
      body?: string;
    }
  ) => {
    const payload: UpdateNewsPayload = {
      title: options.title,
      description: options.description,
      destaque: options.destaque,
    };
    if (options.expireAt !== undefined) {
      payload.expire_at = options.expireAt || null;
    }
    if (options.body !== undefined) {
      payload.body = options.body;
    }

    updateNews(id, payload, token)
      .then((res) => {
        setNews(news.map((n) => (n.id === id ? res : n)));
        modals.modalEdit.close();
        toast.success("Novidade atualizada com sucesso", { theme: "dark" });
      })
      .catch((error: Error) => {
        toast.error(error.message, { theme: "dark" });
      });
  };

  const deleteNew = (id: string) => {
    deleteNews(id, token)
      .then((_) => {
        // A lista é de um status: a desativada sai das "Ativas" (antes ficava,
        // mostrando uma novidade inativa no filtro de ativas).
        setNews((atual) =>
          status === StatusEnum.Approved
            ? atual.filter((n) => n.id !== id)
            : atual.map((n) => (n.id === id ? { ...n, actived: false } : n)),
        );
        modals.modalEdit.close();
        toast.success(`Novidade ${newSelect?.title} deletada com sucesso`);
      })
      .catch((error: Error) => {
        toast.error(`Error - ${error.message}`);
      });
  };

  const carregar = useCallback(async () => {
    setEstado("loading");
    try {
      setNews(await getTodasAsNovidades(token, status));
      setEstado("idle");
    } catch {
      setEstado("error");
    }
  }, [token, status]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O V2 não pagina pelo servidor; o Provider ainda exige a função.
  const getMoreCards = async (): Promise<Paginate<News>> => ({
    data: [],
    page: 0,
    limit: 0,
    totalItems: 0,
  });

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return termo
      ? news.filter((n) => n.title.toLowerCase().includes(termo))
      : news;
  }, [news, busca]);

  const filterProps: FilterProps = {
    placeholder: "Buscar por título",
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value),
    defaultValue: busca,
  };

  const EditNews = () => {
    return !modals.modalEdit.isOpen ? null : (
      <ModalEditNew
        isOpen={modals.modalEdit.isOpen}
        handleClose={() => {
          modals.modalEdit.close();
        }}
        news={newSelect ?? null}
        create={create}
        update={update}
        deleteFunc={deleteNew}
      />
    );
  };

  const selectFiltes: SelectProps[] = [
    {
      "aria-label": "Status",
      options: dashNews.options,
      setState: (value) => setStatus(Number(value) as StatusEnum),
      defaultValue: status,
    },
  ];

  const acaoPrimaria: DashAction = {
    id: "nova-novidade",
    label: "Nova novidade",
    onClick: () => {
      setNewSelect(null);
      modals.modalEdit.open();
    },
  };

  return (
    <DashCardContext.Provider
      value={{
        title: dashNews.title,
        entities: filtradas,
        setEntities: setNews,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        filterProps,
        selectFiltes,
        totalItems: filtradas.length,
      }}
    >
      <DashListTemplate<News>
        columns={colunasDeNovidade}
        actions={{ primary: acaoPrimaria }}
        activeFilterCount={busca.trim() ? 1 : 0}
        totalSemFiltro={news.length}
        onClearFilters={() => setBusca("")}
        defaultSort={ORDENACAO_PADRAO}
        state={estado}
        onRetry={carregar}
        textoVazio="Nenhuma novidade cadastrada"
      />
      {EditNews()}
    </DashCardContext.Provider>
  );
}

export default DashNews;
