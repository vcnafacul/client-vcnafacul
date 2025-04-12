import ModalTemplate from "@/components/templates/modalTemplate";
import PropValue from "../../../components/molecules/PropValue";
import Button from "../../../components/molecules/button";
import { UserRole } from "../../../types/roles/UserRole";
import { formatDate } from "../../../utils/date";

interface ShowUserInfoProps {
  ur: UserRole;
  openUpdateRole: () => void;
  isOpen: boolean;
  handleClose: () => void;
}

function ShowUserInfo({
  ur,
  openUpdateRole,
  isOpen,
  handleClose,
}: ShowUserInfoProps) {
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
              prop="Função"
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
          <Button onClick={openUpdateRole}>Editar Funções</Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ShowUserInfo;
