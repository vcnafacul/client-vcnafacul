/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import Text from "../../../components/atoms/text"
import ModalTemplate from "../../../components/templates/modalTemplate"
import Filter from "../../../components/atoms/filter";
import { Roles } from "../../../enums/roles/roles";
import { CreateRoleDto } from "../../../dtos/roles/createRole";
import Toggle from "../../../components/atoms/toggle";
import Button from "../../../components/molecules/button";
import { createRole } from "../../../services/roles/createRole";
import { useAuthStore } from "../../../store/auth";
import { toast } from "react-toastify";

interface ModalNewRoleProps {
    handleClose: () => void;
}

function ModalNewRole({handleClose} : ModalNewRoleProps) {
    const [valueRoles, setValueRoles] = useState<CreateRoleDto>({
        name: '',
        validarCursinho: false,
        alterarPermissao: false,
        criarSimulado: false,
        bancoQuestoes: true,
        uploadNews: false,
    })

    const { data: { token }} = useAuthStore()

    const handleInputChange = (event: any) => {
        setValueRoles({...valueRoles, name: event.target.value.toLowerCase()})
    }

    const handleCheckChange = (name: string, checked: boolean) => {
        setValueRoles({...valueRoles,  [name]: checked})
    }

    const handleSave = () => {
        createRole(valueRoles, token)
            .then(_ => {
                toast.success(`Permissão ${valueRoles.name} criado com sucesso`);
                handleClose()
            })
            .catch(_ => {
                toast.error(`Error ao tentar criar permissão ${valueRoles.name}`);
            })
    }

    const rolesArray = Object.keys(Roles)
    .filter((key): key is keyof typeof Roles => key in Roles)
    .map(key => Roles[key as keyof typeof Roles]);

    return (
        <ModalTemplate>
            <div className="bg-white p-4 rounded grid grid-cols-1 sm:grid-cols-2">
                <div className="col-span-1 flex flex-col items-start">
                    <Text size="secondary">Criar Novo Perfil de Usuario</Text>
                    <Filter placeholder="Nome do novo perfil" filtrar={handleInputChange} search={false} className="bg-gray-300 p-[1px] rounded-md" />
                </div>
                <div className="col-span-1 flex flex-col items-end">
                    <Text size="secondary">Permissões</Text>
                    {rolesArray.map((role, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <span className="m-0 text-xl font-black text-marine h-9">{role}</span>
                            <div><Toggle name={role} checked={valueRoles[role]} handleCheck={handleCheckChange} /></div>
                        </div>
                    ))}
                    <div className="flex gap-4 w-full flex-col sm:flex-row">
                        <Button disabled={!valueRoles.name} hover={!!valueRoles.name} typeStyle="secondary" onClick={handleSave}>Salvar</Button>
                        <Button hover onClick={handleClose}>Fechar</Button>
                    </div>
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalNewRole