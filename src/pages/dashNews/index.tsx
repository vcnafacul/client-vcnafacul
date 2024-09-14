/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SelectProps } from "../../components/atoms/select";
import { ButtonProps } from "../../components/molecules/button";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import ModalTemplate from "../../components/templates/modalTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { News } from "../../dtos/news/news";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { createNews } from "../../services/news/createNews";
import { deleteNews } from "../../services/news/deleteNews";
import { getAllNews } from "../../services/news/getAllNews";
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";
import { getStatusBool } from "../../utils/getStatusIcon";
import { Paginate } from "../../utils/paginate";
import { dashNews } from "./data";
import ModalEditNew from "./modals/modalEditNew";

function DashNews() {
  const [news, setNews] = useState<News[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newSelect, setNewSelect] = useState<News | null>();
  const [status, setStatus] = useState<StatusEnum>(StatusEnum.Approved);
  const limitCards = 40;

  const {
    data: { token },
  } = useAuthStore();

  const cardTransformation = (n: News): CardDash => ({
    id: n.id,
    title: n.title,
    status: getStatusBool(n.actived),
    infos: [
      { field: "Session", value: n.session },
      { field: "Título", value: n.title },
      {
        field: "Criado em",
        value: n.createdAt ? formatDate(n.createdAt.toString()) : "",
      },
    ],
  });

  const onClickCard = (cardId: number | string) => {
    setNewSelect(news.find((n) => n.id === cardId));
    setOpenModal(true);
  };

  const create = (session: string, title: string, file: any) => {
    const formData = new FormData();
    formData.append("session", session);
    formData.append("title", title);
    formData.append("file", file, title + ".docx");

    createNews(formData, token)
      .then((res) => {
        news.push(res);
        setNews(news);
        setOpenModal(false);
        toast.success(`Novidade ${res.title} criado com sucesso`, {
          theme: "dark",
        });
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
        setOpenModal(false);
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
        const uniqueSessions = new Set<string>();
        res.data.map((r) => {
          uniqueSessions.add(r.session);
        });
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [status]);

  const getMoreCards = async (page: number): Promise<Paginate<News>> => {
    return await getAllNews(token, page, limitCards, status);
  };

  const EditNews = () => {
    return (
      <ModalTemplate
        isOpen={openModal}
        handleClose={() => {
          setOpenModal(false);
        }}
        outSideClose
      >
        <ModalEditNew
          news={newSelect!}
          create={create}
          deleteFunc={deleteNew}
        />
      </ModalTemplate>
    );
  };

  const selectFiltes: SelectProps[] = [
    { options: dashNews.options, setState: setStatus, defaultValue: status },
  ];

  const buttons: ButtonProps[] = [
    {
      onClick: () => {
        setNewSelect(null);
        setOpenModal(true);
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
