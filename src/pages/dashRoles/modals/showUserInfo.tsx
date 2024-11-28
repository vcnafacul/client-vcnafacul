/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ModalTemplate from "@/components/templates/modalTemplate";
import { useState } from "react";
import { toast } from "react-toastify";
import Toggle from "../../../components/atoms/toggle";
import PropValue from "../../../components/molecules/PropValue";
import Button from "../../../components/molecules/button";
import { changeCollaborator } from "../../../services/auth/changeCollaborator";
import { useAuthStore } from "../../../store/auth";
import { UserRole } from "../../../types/roles/UserRole";
import { formatDate } from "../../../utils/date";

interface ShowUserInfoProps {
  ur: UserRole;
  openUpdateRole: () => void;
  updateUser: (ur: UserRole) => void;
  isOpen: boolean;
  handleClose: () => void;
}

function ShowUserInfo({
  ur,
  openUpdateRole,
  updateUser,
  isOpen,
  handleClose,
}: ShowUserInfoProps) {
  const [collaborator, setCollaborator] = useState<boolean>(
    ur.user.collaborator
  );
  const [description, setDescription] = useState<string | null | undefined>(
    ur.user.collaboratorDescription
  );
  const change =
    collaborator !== ur.user.collaborator ||
    description !== ur.user.collaboratorDescription;

  const {
    data: { token },
  } = useAuthStore();

  const changeDescription = (event: any) => {
    if (event.target.value !== "") {
      setDescription(event.target.value);
    } else {
      setDescription(null);
    }
  };

  const saveChanges = () => {
    changeCollaborator(ur.user.id, collaborator, description, token)
      .then((_) => {
        toast.success("Atualizado com Sucesso");
        ur.user.collaborator = collaborator;
        ur.user.collaboratorDescription = description;
        updateUser(ur);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-2 rounded-md"
    >
      <div className=" p-4 rounded md:min-w-[700px] overflow-y-auto scrollbar-hide h-4/5 sm:h-fit">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
          <PropValue
            prop="Name"
            value={`${ur.user.firstName} ${ur.user.lastName}`}
          />
          <div className="bg-zinc-800 p-2 rounded shadow-md shadow-gray-300">
            <PropValue
              prop="Permissão"
              value={ur.roleName}
              className="text-white"
            />
          </div>
          <PropValue prop="Email" value={ur.user.email} />
          <PropValue prop="Telefone" value={ur.user.phone} />
          <PropValue prop="Estado" value={ur.user.state} />
          <PropValue prop="Cidade" value={ur.user.city} />
          <div className="col-span-1 sm:col-span-2">
            <PropValue
              prop="Sobre"
              value={ur.user.about ? ur.user.about : ""}
            />
          </div>
          <div className="sm:col-start-2 md:justify-self-end">
            <PropValue
              prop="Colaborador"
              value={
                <Toggle
                  name="Colaborador"
                  checked={collaborator}
                  handleCheck={() => {
                    setCollaborator(!collaborator);
                  }}
                />
              }
            />
          </div>
          {!collaborator ? (
            <></>
          ) : (
            <div className="col-span-2">
              <input
                className="bg-white appearance-none box-border w-full rounded border 
                            text-grey text-xs outline-orange bg-no-repeat md:text-base p-2"
                onChange={changeDescription}
                value={description ? description : ""}
              />
            </div>
          )}
          <div className="col-start-1 sm:col-start-2 justify-self-end">
            <Button
              disabled={!change}
              size="small"
              className="w-40"
              onClick={saveChanges}
            >
              Salvar Alterações
            </Button>
          </div>
          <div className="col-span-1 sm:col-span-2 bg-zinc-200 p-2 rounded shadow-md shadow-zinc-300">
            <PropValue
              prop="Criado em"
              value={formatDate(ur.user.createdAt.toString())}
            />
            <PropValue
              prop="Ultima Atualização"
              value={formatDate(ur.user.updatedAt.toString())}
            />
            {ur.user.deletedAt ? (
              <PropValue
                prop="Deletado em"
                value={formatDate(ur.user.deletedAt.toString())}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="flex gap-4 py-2">
          <Button hover onClick={openUpdateRole}>
            Editar Permissão
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ShowUserInfo;
