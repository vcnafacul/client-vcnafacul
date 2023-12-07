import { useEffect, useState } from "react"
import Text from "../../../components/atoms/text"
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { UserRole } from "../../../types/roles/UserRole"
import { RolesResponse, getRole } from "../../../services/roles/getRole"
import { useAuthStore } from "../../../store/auth"
import { toast } from "react-toastify"
import { Role } from "../../../types/roles/role"

import {ReactComponent as StatusRejected } from "../../../assets/icons/statusApproved.svg";
import {ReactComponent as StatusApproved } from "../../../assets/icons/statusApproved.svg";

interface ModalRoleProps extends ModalProps {
    userRole: UserRole;
    roles: Role[]
    updateUserRole: (user: UserRole) => void;
}

function ModalRole({userRole, handleClose, roles, updateUserRole} : ModalRoleProps) {
    const [newRole, setNewRole] = useState<number>(userRole.roleId)
    const [roleInfo, setRoleInfo] = useState<RolesResponse>({} as RolesResponse)
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const { data: { token }} = useAuthStore()

    const updateRole = async () => {
            const newUser : UserRole = {...userRole, roleId: newRole, roleName: roles.find(r => r.id == newRole)!.name}
            updateUserRole(newUser)
        
    }

    useEffect(() => {
        getRole(newRole, token)
        .then(res => {
            setRoleInfo(res)
            console.log(res)
        })
        .catch((error: Error) => {
            toast.error(error.message)
            setRoleInfo({} as RolesResponse)
        })
    }, [newRole, token])
    
    return (
        <ModalTemplate >
            <div className="bg-white flex flex-col gap-4 p-4 rounded mx-4">
                <div className="flex gap-x-4">
                    <div className="flex flex-col items-start w-[400px]">
                    <Text size="secondary">Informações do Usuário:</Text>
                    <div className="flex gap-4">
                        <Text size="tertiary" className="font-black m-0">Nome:</Text>
                        <Text size="quaternary" className="m-0">{userRole.userName}</Text>
                    </div>
                    <div className="flex gap-4">
                        <Text size="tertiary" className="font-black m-0">Email:</Text>
                        <Text size="quaternary" className="m-0">{userRole.userEmail}</Text>
                    </div>
                    <div className="flex gap-4">
                        <Text size="tertiary" className="font-black m-0">Telefone:</Text>
                        <Text size="quaternary" className="m-0">{userRole.userPhone}</Text>
                    </div>
                    </div>    
                    <div className="w-[400px]">
                        <Text size="secondary">Permissões</Text>
                        {roleInfo.id !== undefined ? roleInfo.permissoes.map(r => (
                            <div className="flex gap-4 items-center justify-end">
                                <span className="m-2 text-base text-marine font-black">{r.name}</span>
                                {r.liberado ? <StatusApproved /> : <StatusRejected />}
                            </div>
                        )) : <></>}
                    </div>
                </div>
                <div className="flex gap-4 w-[400px] self-end">
                    {isEditing ? 
                    <Button typeStyle="primary" onClick={updateRole}>Salvar</Button> : 
                    <Button typeStyle="secondary" onClick={() => setIsEditing(true)}>Editar</Button>}
                    <Button onClick={isEditing ? () => setIsEditing(false) : handleClose}>{isEditing ? 'Voltar' : 'Fechar'}</Button>
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalRole