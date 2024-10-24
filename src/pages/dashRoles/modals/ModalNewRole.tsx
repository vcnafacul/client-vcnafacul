/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { toast } from "react-toastify";
import Filter from "../../../components/atoms/filter";
import Text from "../../../components/atoms/text";
import Toggle from "../../../components/atoms/toggle";
import Button from "../../../components/molecules/button";
import { ModalProps } from "../../../components/templates/modalTemplate";
import { CreateRoleDto } from "../../../dtos/roles/createRole";
import { RolesLabel } from "../../../enums/roles/roles";
import { createRole } from "../../../services/roles/createRole";
import { useAuthStore } from "../../../store/auth";
import { Role } from "../../../types/roles/role";

interface ModalNewRole extends ModalProps {
  handleNewRole: (role: Role) => void;
}

function ModalNewRole({ handleNewRole, handleClose }: ModalNewRole) {
  const [valueRoles, setValueRoles] = useState<CreateRoleDto>({
    name: "",
    validarCursinho: false,
    alterarPermissao: false,
    criarSimulado: false,
    visualizarQuestao: false,
    criarQuestao: false,
    validarQuestao: false,
    uploadNews: false,
    visualizarProvas: false,
    cadastrarProvas: false,
    visualizarDemanda: false,
    uploadDemanda: false,
    validarDemanda: false,
    gerenciadorDemanda: false,
    gerenciarInscricoesCursinhoParceiro: false,
  });

  const {
    data: { token },
  } = useAuthStore();

  const handleInputChange = (event: any) => {
    setValueRoles({ ...valueRoles, name: event.target.value.toLowerCase() });
  };

  const handleCheckChange = (name: string, checked: boolean) => {
    setValueRoles({ ...valueRoles, [name]: checked });
  };

  const handleSave = () => {
    createRole(valueRoles, token)
      .then((role) => {
        handleNewRole({ name: role.name, id: role.id });
        handleClose!();
        toast.success(`Permissão ${valueRoles.name} criado com sucesso`);
      })
      .catch((_) => {
        toast.error(`Error ao tentar criar permissão ${valueRoles.name}`);
      });
  };

  return (
    <>
      <div className="bg-white p-4 rounded grid grid-cols-1 sm:grid-cols-2">
        <div className="col-span-1 flex flex-col items-start">
          <Text size="secondary">Criar Novo Perfil de Usuario</Text>
          <Filter
            placeholder="Nome do novo perfil"
            filtrar={handleInputChange}
            search={false}
            className="bg-gray-300 p-[1px] rounded-md"
          />
        </div>
        <div className="col-span-1 flex flex-col items-end">
          <Text size="secondary">Permissões</Text>
          {RolesLabel.map((role, index) => (
            <div key={index} className="flex gap-2 items-center">
              <span className="m-0 text-xl font-black text-marine h-9">
                {role.label}
              </span>
              <div>
                <Toggle
                  name={role.value}
                  checked={valueRoles[role.value]}
                  handleCheck={handleCheckChange}
                />
              </div>
            </div>
          ))}
          <div className="flex gap-4 w-full flex-col sm:flex-row">
            <Button
              disabled={!valueRoles.name}
              hover={!!valueRoles.name}
              typeStyle="secondary"
              onClick={handleSave}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalNewRole;
