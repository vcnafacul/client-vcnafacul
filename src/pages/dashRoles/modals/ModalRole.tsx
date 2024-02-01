import { useEffect, useState } from "react"
import Text from "../../../components/atoms/text"
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { UserRole } from "../../../types/roles/UserRole"
import { RolesResponse, getRole } from "../../../services/roles/getRole"
import { useAuthStore } from "../../../store/auth"
import { toast } from "react-toastify"
import { Role } from "../../../types/roles/role"

import {ReactComponent as StatusRejected } from "../../../assets/icons/statusRejected.svg";
import {ReactComponent as StatusApproved } from "../../../assets/icons/statusApproved.svg";
import Select from "../../../components/atoms/select"

interface ModalRoleProps extends ModalProps {
    userRole: UserRole;
    roles: Role[]
    updateUserRole: (user: UserRole) => void;
}

function ModalRole({userRole, handleClose, roles, updateUserRole} : ModalRoleProps) {
    const [newRole, setNewRole] = useState<number>(userRole.roleId)
    const [roleInfo, setRoleInfo] = useState<RolesResponse | undefined>(undefined)
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const { data: { token }} = useAuthStore()

    const updateRole = async () => {
            const newUser : UserRole = {...userRole, roleId: newRole, roleName: roles.find(r => r.id == newRole)!.name}
            updateUserRole(newUser)
    }

    const ShowRoleInfo = () => {
        if(!roleInfo) return null
        return roleInfo.permissoes.map((r) => (
            <div key={r.name} className="flex gap-4 items-center justify-end">
                <span className="m-2 text-base text-marine font-normal">{r.name}</span>
                {r.liberado ? <StatusApproved /> : <StatusRejected />}
            </div>
        ))
    }

    const cameBackRole = () => {
        setIsEditing(false)
        setNewRole(userRole.roleId)
    }

    useEffect(() => {
        getRole(newRole, token)
        .then(res => {
            setRoleInfo(res)
        })
        .catch((error: Error) => {
            toast.error(error.message)
            setRoleInfo({} as RolesResponse)
        })
    }, [newRole, token])
    
    return (
        <ModalTemplate >
            <div className="bg-white flex flex-col gap-4 p-4 rounded mx-4 w-96">
                <div className="flex flex-col">
                        <Text size="secondary">Permissões</Text>
                        {isEditing ? 
                        <Select options={roles} defaultValue={userRole.roleId} setState={setNewRole} /> : 
                        <Text size="tertiary" className="flex justify-end font-black text-marine m-0">{userRole.roleName}</Text>}
                        <ShowRoleInfo />
                </div>
                <div className="flex gap-4">
                    {isEditing ? 
                    <Button typeStyle="primary" onClick={updateRole}>Salvar</Button> : 
                    <Button typeStyle="secondary" onClick={() => setIsEditing(true)}>Editar</Button>}
                    <Button onClick={isEditing ? cameBackRole : handleClose}>{isEditing ? 'Voltar' : 'Fechar'}</Button>
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalRole