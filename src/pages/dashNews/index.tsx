/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SelectProps } from "../../components/atoms/select";
import { ButtonProps } from "../../components/molecules/button";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { News } from "../../dtos/news/news";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { createNews } from "../../services/news/createNews";
import { deleteNews } from "../../services/news/deleteNews";
import { getAllNews } from "../../services/news/getAllNews";
import { updateNews, UpdateNewsPayload } from "../../services/news/updateNews";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { getStatusBool } from "../../utils/getStatusIcon";
import { Paginate } from "../../utils/paginate";
import { dashNews } from "./data";
import ModalEditNew from "./modals/modalEditNew";
import { useModals } from "@/hooks/useModal";

function DashNews() {
  const [news, setNews] = useState<News[]>([]);
  const [newSelect, setNewSelect] = useState<News | null>();
  const [status, setStatus] = useState<StatusEnum>(StatusEnum.Approved);
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
        setNews(
          news.map((n) => {
            if (n.id === id) {
              n.actived = false;
              return n;
            }
            return n;
          })
        );
        modals.modalEdit.close();
        toast.success(`Novidade ${newSelect?.title} deletada com sucesso`);
      })
      .catch((error: Error) => {
        toast.error(`Error - ${error.message}`);
      });
  };

  useEffect(() => {
    getAllNews(token, 1, limitCards, status)
      .then((res) => {
        setNews(res.data);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [status]);

  const getMoreCards = async (page: number): Promise<Paginate<News>> => {
    return await getAllNews(token, page, limitCards, status);
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
    { options: dashNews.options, setState: setStatus, defaultValue: status },
  ];

  const buttons: ButtonProps[] = [
    {
      onClick: () => {
        setNewSelect(null);
        modals.modalEdit.open();
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Criar Novidade",
    },
  ];

  return (
    <DashCardContext.Provider
      value={{
        title: dashNews.title,
        entities: news,
        setEntities: setNews,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        selectFiltes,
        buttons,
      }}
    >
      <DashCardTemplate />
      <EditNews />
    </DashCardContext.Provider>
  );
}

export default DashNews;
