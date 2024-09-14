import { useEffect, useState } from "react";
import { TbArrowsExchange } from "react-icons/tb";
import { toast } from "react-toastify";
import Text from "../../../components/atoms/text";
import PropValue from "../../../components/molecules/PropValue";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { ChangeOrderDTO } from "../../../dtos/content/changeOrder";
import { ContentDtoInputOrder } from "../../../dtos/content/contentDtoInput";
import { Insert } from "../../../enums/content/insert";
import { changeOrderDemand } from "../../../services/content/changeOrderDemand";
import { getContentOrder } from "../../../services/content/getContent";
import { useAuthStore } from "../../../store/auth";
import { formatDate } from "../../../utils/date";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import ChangeOrder from "./changeOrder";

interface ViewOrderProps {
  subjectId: string;
}

export interface DemandSelected {
  title: string;
  nodeId: string;
  order: number;
}

function ViewOrder({ subjectId }: ViewOrderProps) {
  const [contents, setContents] = useState<ContentDtoInputOrder[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [demandSelected, setDemandSelected] = useState<DemandSelected>();

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    getContentOrder(token, undefined, subjectId)
      .then((res) => {
        setContents(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  }, [subjectId, token]);

  const Contents = () =>
    contents.map((content, index) => (
      <div
        key={index}
        className={`${index % 2 == 0 ? "bg-blue-200" : "bg-white"}`}
      >
        <div className="flex gap-4">
          <div className="w-10 flex justify-center items-center">
            {getStatusIcon(content.status)}
          </div>
          <div className="w-60">
            <PropValue prop="Título" value={content.title} />
          </div>
          <div className="w-60">
            <PropValue
              prop="Criado em"
              value={formatDate(content.createdAt.toString())}
            />
          </div>
          <div className="w-28">
            <PropValue prop="Ordem" value={index + 1} />
          </div>
          <TbArrowsExchange
            className="w-7 h-7 rotate-90 cursor-pointer"
            title="Alterar Order"
            onClick={() => {
              setDemandSelected({
                nodeId: content.id,
                title: content.title,
                order: index + 1,
              });
              setOpenModal(true);
            }}
          />
        </div>
      </div>
    ));

  const updateNode = (position: number) => {
    const node2 = contents[position - 1].id;
    const body: ChangeOrderDTO = {
      listId: subjectId,
      node1: demandSelected!.nodeId,
      node2: node2,
      where:
        contents.findIndex((cont) => cont.id == demandSelected!.nodeId) >
        position - 1
          ? Insert.Front
          : Insert.Back,
    };
    changeOrderDemand(token, body)
      .then(() => {
        const objetoSelecionado = contents.find(
          (obj) => obj.id === demandSelected!.nodeId
        );
        const listaAtualizada = contents.filter(
          (obj) => obj.id !== demandSelected!.nodeId
        );
        listaAtualizada.splice(position - 1, 0, objetoSelecionado!);
        setContents(listaAtualizada);
        setOpenModal(false);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  const ModalChengeOrder = () => {
    return (
      <ModalTemplate
        isOpen={openModal}
        handleClose={() => {
          setOpenModal(false);
        }}
      >
        <ChangeOrder
          updateNode={updateNode}
          demand={demandSelected!}
          optionNumber={contents.map((c) => ({ id: c.id, name: c.title }))}
        />
      </ModalTemplate>
    );
  };

  return (
    <>
      <>
        <div className="bg-white py-2 px-4 rounded">
          {contents.length > 0 ? (
            <Text size="secondary">{contents[0].subject.name}</Text>
          ) : (
            <></>
          )}
          <Contents />
        </div>
      </>
      <ModalChengeOrder />
    </>
  );
}

export default ViewOrder;
