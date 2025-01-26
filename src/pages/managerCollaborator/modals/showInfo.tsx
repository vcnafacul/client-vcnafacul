import Button from "@/components/molecules/button";
import PropValue from "@/components/molecules/PropValue";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Collaborator } from "@/types/partnerPrepCourse/collaborator";
import { formatDate } from "@/utils/date";

interface ModalProps {
  handleClose: () => void;
  isOpen: boolean;
  collaborator: Collaborator;
}

export function ShowInfo({ collaborator, handleClose, isOpen }: ModalProps) {
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
            value={`${collaborator.user.firstName} ${collaborator.user.lastName}`}
          />
          <div className="bg-zinc-800 p-2 rounded shadow-md shadow-gray-300">
            <PropValue
              prop="Permissão"
              value={"Ajustar"}
              className="text-white"
            />
          </div>
          <PropValue prop="Email" value={collaborator.user.email} />
          <PropValue prop="Telefone" value={collaborator.user.phone} />
          <div className="col-span-1 sm:col-span-2">
            <PropValue prop="Descrição" value={collaborator.description} />
          </div>
          <div className="col-span-1 sm:col-span-2 bg-zinc-200 p-2 rounded shadow-md shadow-zinc-300">
            <PropValue
              prop="Criado em"
              value={formatDate(collaborator.createdAt.toString())}
            />
            <PropValue
              prop="Ultima Atualização"
              value={formatDate(collaborator.updatedAt.toString())}
            />
          </div>
        </div>
        <div className="flex gap-4 py-2">
          <Button onClick={() => {}}>Editar Permissão</Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
