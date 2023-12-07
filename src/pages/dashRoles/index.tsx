/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react"
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import { headerDash } from "../dash/data"
import { dashRoles } from "./data"
import { getRoles } from "../../services/roles/getRoles"
import { useAuthStore } from "../../store/auth"
import { Role } from "../../types/roles/role"
import { toast } from "react-toastify"
import { UserRole } from "../../types/roles/UserRole"
import { getUsersRole } from "../../services/roles/getUsersRole"
import { CardDashInfo } from "../../components/molecules/cardDash"
import { StatusEnum } from "../../types/generic/statusEnum"
import ModalRole from "./modals/ModalRole"
import { updateRole } from "../../services/roles/updateRole"

function DashRoles(){
    const [roles, setRoles] = useState<Role[]>([])
    const [usersRole, setUsersRole]= useState<UserRole[]>([])
    const [userRoleSelect, setUserRoleSelect] = useState<UserRole>()
    const [openModal, setOpenModal] = useState<boolean>(false);
    const dataRef = useRef<UserRole[]>([])

    const { data: { token }} = useAuthStore()

    const cardUserRole : CardDashInfo[] = usersRole.map(user => (
        {cardId: user.userId, title: user.userName, status: StatusEnum.Approved, infos: 
            [
                { field:"Email", value: user.userEmail },
                { field:"Telefone", value: user.userPhone },
                { field:"Permissao", value: user.roleName},
            ]
        }
    ))

    const onClickCard = (userId: number | string) => {
        setUserRoleSelect(usersRole.find(user => user.userId === userId))
        setOpenModal(true)
    }

    const updateUserRole = (userRole: UserRole) => {
        setOpenModal(false)
        console.log(userRole)
        updateRole(userRole.userId, userRole.roleId, token)
            .then(_ => {
                setUsersRole(usersRole.map(user => {
                    if(user.userId === userRole.userId) return userRole
                    return user
                }))
                toast.success(`Atualização da permissão do usuário  ${userRole.userName} feita com sucesso`)
            })
            .catch((error: Error) => {
                toast.error(`${error.message} - Usuário ${userRole.userName}`)
            })
    }

    useEffect(() => {
        getRoles(token).then(res => {
            setRoles(res)
        }).catch((error: Error) => {
            toast.error(error.message)
            setRoles([])
        })

        getUsersRole(token)
            .then(res => {
                setUsersRole(res.sort((a, b) => a.userName.localeCompare(b.userName)))
                dataRef.current = res;
            })
            .catch((error: Error) => {
                toast.error(error.message)
                setUsersRole([])
            })

    }, [])

    const ShowUserRole = () => {
        if(!openModal) return null
        return <ModalRole 
            roles={roles} 
            updateUserRole={updateUserRole}
            userRole={userRoleSelect!}
            handleClose={() => setOpenModal(false)} />
    }
    
    return (
        <>
            <DashCardTemplate 
                header={headerDash}
                cardlist={cardUserRole}
                onClickCard={onClickCard}
                title={dashRoles.title}
                filterList={[]}
            />
            <ShowUserRole />
        </>
    )
}

export default DashRoles