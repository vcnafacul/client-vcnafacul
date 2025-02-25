import Toggle from "@/components/atoms/toggle";
import Button from "@/components/molecules/button";
import PropValue from "@/components/molecules/PropValue";
import { InputFactory } from "@/components/organisms/inputFactory";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Collaborator } from "@/types/partnerPrepCourse/collaborator";
import { formatDate } from "@/utils/date";
import { useState } from "react";
import { toast } from "react-toastify";

interface ModalProps {
  handleClose: () => void;
  isOpen: boolean;
  collaborator: Collaborator;
  handleActive: (id: string) => Promise<void>;
  handleDescription: (id: string, description: string) => Promise<void>;
}

export function ShowInfo({
  collaborator,
  handleClose,
  isOpen,
  handleActive,
  handleDescription,
}: ModalProps) {
  const [actived, setActived] = useState<boolean>(collaborator.actived);
  const [description, setDescription] = useState<string>(
    collaborator.description
  );
  const [loading, setLoading] = useState<string>("Atualizar");
  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md"
    >
      <div className="p-4 rounded-md overflow-y-auto scrollbar-hide h-4/5 sm:h-fit">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {collaborator.photo && (
            <div className="w-56 h-40">
              <img
                className="rounded-full object-cover shadow-md"
                src={VITE_FTP_PROFILE + collaborator.photo}
                alt={collaborator.user.firstName}
              />
            </div>
          )}
          <div className="flex flex-col gap-2 w-full">
            <div className="bg-zinc-800 p-2 rounded shadow-md">
              <PropValue
                prop="Permissão"
                value="Ajustar"
                className="text-white"
              />
            </div>
            <PropValue
              prop="Nome"
              value={`${collaborator.user.firstName} ${collaborator.user.lastName}`}
            />
            <PropValue prop="Email" value={collaborator.user.email} />
            <PropValue prop="Telefone" value={collaborator.user.phone} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="sm:col-start-2 md:justify-self-end">
            <PropValue
              prop="Ativo"
              value={
                <Toggle
                  name="ativo"
                  checked={actived}
                  handleCheck={() => {
                    handleActive(collaborator.id)
                      .then(() => setActived(!actived))
                      .catch((e) => toast.error(e.message));
                  }}
                />
              }
            />
          </div>
          <div className="col-span-1 sm:col-span-2 flex gap-2">
            <InputFactory
              id="description"
              label="Descrição"
              type="text"
              value={description}
              className="h-12 flex-1"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDescription(e.target.value)
              }
            />
            <Button
              onClick={() => {
                setLoading("Atualizando...");
                handleDescription(collaborator.id, description)
                  .catch((e) => toast.error(e.message))
                  .finally(() => setLoading("Atualizar"));
              }}
              className="w-64 font-light"
              disabled={loading === "Atualizando..."}
            >
              {loading}
            </Button>
          </div>
          <div className="col-span-1 sm:col-span-2 bg-zinc-200 p-2 rounded shadow-md shadow-zinc-300">
            <PropValue
              prop="Último Acesso"
              value={formatDate(collaborator.lastAccess?.toString())}
            />
          </div>
        </div>
      </div>
    </ModalTemplate>
  );
}
