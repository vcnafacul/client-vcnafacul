import Toggle from "@/components/atoms/toggle";
import Button from "@/components/molecules/button";
import PropValue from "@/components/molecules/PropValue";
import { InputFactory } from "@/components/organisms/inputFactory";
import ModalTemplate from "@/components/templates/modalTemplate";
import { Badge } from "@/components/ui/badge";
import { Afinidade } from "@/types/partnerPrepCourse/afinidades";
import { getColorFromName, getTextColorFromName } from "@/utils/getColorFromName";
import { formatDate } from "@/utils/date";
import { phoneMask } from "@/utils/phoneMask";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getCollaboratorFrentesEnriched } from "@/services/prepCourse/collaborator/get-collaborator-frentes";
import { useAuthStore } from "@/store/auth";
import { CollaboratorColumns } from "..";

interface ModalProps {
  handleClose: () => void;
  isOpen: boolean;
  collaborator: CollaboratorColumns;
  photoUrl?: string;
  handleActive: (id: string) => Promise<void>;
  handleDescription: (id: string, description: string) => Promise<void>;
  openUpdateRole: () => void;
}

function toAfinidades(
  frentes: { id: string; nome: string; materia: string }[],
  materias: { id: string; nome: string }[]
): Afinidade[] {
  const materiaMap = new Map(materias.map((m) => [m.id, m.nome]));
  return frentes.map((f) => ({
    frenteId: f.id,
    frenteNome: f.nome,
    materiaId: f.materia,
    materiaNome: materiaMap.get(f.materia) ?? "",
    adicionadoEm: undefined as unknown as Date,
  }));
}

export function ShowInfo({
  collaborator,
  photoUrl,
  handleClose,
  isOpen,
  handleActive,
  handleDescription,
  openUpdateRole,
}: ModalProps) {
  const [actived, setActived] = useState<boolean>(collaborator.actived);
  const [description, setDescription] = useState<string>(
    collaborator.description
  );
  const [loading, setLoading] = useState<string>("Atualizar");
  const [afinidades, setAfinidades] = useState<Afinidade[]>([]);
  const [frentesLoading, setFrentesLoading] = useState(false);
  const { data: { token } } = useAuthStore();
  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

  useEffect(() => {
    if (!isOpen || !collaborator?.id || !token) return;
    setFrentesLoading(true);
    getCollaboratorFrentesEnriched(collaborator.id, token)
      .then((res) => setAfinidades(toAfinidades(res.frentes, res.materias)))
      .catch(() => setAfinidades([]))
      .finally(() => setFrentesLoading(false));
  }, [isOpen, collaborator?.id, token]);

  const materiasUnicas = useMemo(
    () => Array.from(new Set(afinidades.map((a) => a.materiaNome).filter(Boolean))),
    [afinidades]
  );
  const frentesUnicas = useMemo(
    () => Array.from(new Set(afinidades.map((a) => a.frenteNome).filter(Boolean))),
    [afinidades]
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md w-[90vw] sm:w-[750px]"
    >
      <div className="p-4 rounded-md overflow-y-auto scrollbar-hide h-4/5 sm:h-fit">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {collaborator.photo && (
            <div className="w-56 h-40">
              <img
                className="rounded-full object-cover shadow-md shadow-stone-500 w-40 h-40"
                src={photoUrl || `${VITE_FTP_PROFILE}${collaborator.photo}`}
                alt={collaborator.name}
              />
            </div>
          )}
          <div className="flex flex-col gap-2 w-full">
            {frentesLoading ? (
              <div className="text-sm text-gray-500 italic">Carregando...</div>
            ) : (materiasUnicas.length > 0 || frentesUnicas.length > 0) ? (
              <div className="flex flex-col gap-2">
                {materiasUnicas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {materiasUnicas.map((nome) => (
                      <Badge
                        key={nome}
                        variant="secondary"
                        className={`inline-flex items-center px-3 py-1 text-xs ${getColorFromName(nome)} ${getTextColorFromName(nome)}`}
                      >
                        {nome}
                      </Badge>
                    ))}
                  </div>
                )}
                {frentesUnicas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {frentesUnicas.map((nome) => (
                      <Badge
                        key={nome}
                        variant="secondary"
                        className={`inline-flex items-center px-3 py-1 text-xs ${getColorFromName(nome)} ${getTextColorFromName(nome)}`}
                      >
                        {nome}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            <div className="bg-zinc-800 p-2 rounded shadow-black shadow-md">
              <PropValue
                prop="Função"
                value={collaborator.role.name}
                className="text-white"
              />
            </div>
            <PropValue
              prop="Nome"
              value={collaborator.name}
            />
            <PropValue prop="Email" value={collaborator.email} />
            <PropValue prop="Telefone" value={phoneMask(collaborator.phone)} />
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
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
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
              className="sm:w-64 font-light"
              disabled={loading === "Atualizando..."}
            >
              {loading}
            </Button>
          </div>
          <div className="col-span-1 sm:col-span-2 bg-zinc-200 p-2 rounded shadow-md shadow-zinc-300">
            <PropValue
              prop="Último Acesso"
              value={formatDate(collaborator.lastAccess?.toString(), "dd/MM/yyyy HH:mm")}
            />
          </div>
        </div>
        <div className="flex gap-4 py-2">
          <Button onClick={openUpdateRole} typeStyle="refused">
            Editar Função
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
