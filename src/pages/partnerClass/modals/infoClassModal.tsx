import { ReactComponent as TrashIcon } from "@/assets/icons/trash.svg";
import Button from "@/components/molecules/button";
import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import ModalTemplate from "@/components/templates/modalTemplate";
import { formatDate } from "@/utils/date";
import { useState } from "react";
import { dataClass } from "../data";

import BLink from "@/components/molecules/bLink";
import { ClassEntityOutput } from "@/dtos/classes/classOutput";
import { Roles } from "@/enums/roles/roles";
import { DASH, PARTNER_CLASS } from "@/routes/path";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { ClassCreateEditModal } from "./classCreateEditModal";

interface ClassInfoModalProps {
  isOpen: boolean;
  handleClose: () => void;
  entity: ClassEntity;
  handleEdit: (data: ClassEntityOutput) => Promise<void>;
  handleDelete: () => Promise<void>;
}

export function ClassInfoModal({
  isOpen,
  handleClose,
  entity,
  handleEdit,
  handleDelete,
}: ClassInfoModalProps) {
  const [entitySelected, setEntitySelected] = useState<ClassEntity>(entity);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const {
    data: { permissao },
  } = useAuthStore();

  const ModalDelete = () => {
    return (
      <ModalConfirmCancel
        isOpen={openModalDelete}
        handleClose={() => {
          setOpenModalDelete(false);
        }}
        text={dataClass.warningDeleteClass}
        handleConfirm={() => {
          handleDelete().then(() => {
            setOpenModalDelete(false);
            handleClose();
          });
        }}
        className="bg-white p-2 rounded-md"
      ></ModalConfirmCancel>
    );
  };

  const myHandleEdit = (data: ClassEntityOutput) => {
    handleEdit(data).then(() => {
      setEntitySelected({
        ...entitySelected!,
        name: data.name,
        description: data.description,
        startDate: data.range[0],
        endDate: data.range[1],
        year: new Date(data.range[0]).getFullYear(),
      });
      setOpenModalEdit(false);
    });
  };

  const ModalEdit = () => {
    return openModalEdit ? (
      <ClassCreateEditModal
        isOpen={openModalEdit}
        entity={entitySelected}
        handleClose={() => setOpenModalEdit(false)}
        onCreateEdit={myHandleEdit}
      />
    ) : null;
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md"
    >
      <div className=" max-w-2xl min-w-[90%] sm:min-w-[550px] flex flex-col gap-4">
        <h1 className="text-left text-marine text-3xl font-black">
          {entitySelected?.name}
        </h1>
        <p>{entitySelected?.description}</p>
        <div className="flex gap-4">
          <p>
            <strong>Início: </strong>
            {entitySelected?.startDate
              ? formatDate(entitySelected?.startDate.toString())
              : ""}
          </p>
          <p>
            <strong>Final: </strong>
            {entitySelected?.startDate
              ? formatDate(entitySelected?.endDate.toString())
              : ""}
          </p>
        </div>
        <div className="flex gap-4">
          <p>
            <strong>Quantidade de Alunos:</strong>{" "}
            {entitySelected?.number_students}
          </p>
        </div>
        <div className="flex flex-col-reverse items-center gap-4 sm:flex-row relative">
          <BLink
            className="h-8 w-36 bg-green2 border-none hover:bg-green2/60"
            to={`${DASH}/${PARTNER_CLASS}/${entitySelected?.id}`}
          >
            <div className="flex justify-center gap-1.5">
              <p className="text-sm w-fit">Lista de Alunos</p>
            </div>
          </BLink>
          {permissao[Roles.gerenciarTurmas] && (
            <div className="flex flex-1 justify-end gap-4">
              <Button
                className="w-24 h-8 bg-red border-none hover:bg-red/60 "
                onClick={() => setOpenModalDelete(true)}
              >
                <div className="flex justify-center gap-1.5">
                  <TrashIcon />
                  <p className="text-sm w-fit">Deletar</p>
                </div>
              </Button>
              <Button
                typeStyle="secondary"
                className="w-24 h-8"
                onClick={() => setOpenModalEdit(true)}
              >
                Editar
              </Button>
            </div>
          )}
        </div>
        <ModalEdit />
        <ModalDelete />
      </div>
    </ModalTemplate>
  );
}
