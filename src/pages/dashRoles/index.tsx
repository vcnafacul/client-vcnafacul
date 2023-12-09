/* eslint-disable @typescript-eslint/no-explicit-any */
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
import ModalNewRole from "./modals/ModalNewRole"
import Button from "../../components/molecules/button"
import Filter from "../../components/atoms/filter"

function DashRoles(){
    const [roles, setRoles] = useState<Role[]>([])
    const [usersRole, setUsersRole]= useState<UserRole[]>([])
    const [userRoleSelect, setUserRoleSelect] = useState<UserRole | null>()
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [newRole, setnewRole] = useState<boolean>(false);
    const dataRef = useRef<UserRole[]>([])

    const { data: { token }} = useAuthStore()

    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setUsersRole(dataRef.current)
        else setUsersRole(dataRef.current.filter(q => q.userName.toLowerCase().includes(filter) || q.roleName.toLowerCase().includes(filter)))
    }

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
            roles={roles.filter(r => { if(r.name !== 'Todos'){ return r}})} 
            updateUserRole={updateUserRole}
            userRole={userRoleSelect!}
            handleClose={() => setOpenModal(false)} />
    }

    const ShowNewRole = () => {
        if(!newRole) return null
        return <ModalNewRole handleClose={() => setnewRole(false)} />
    }
    
    return (
        <>
            <DashCardTemplate 
                header={headerDash}
                cardlist={cardUserRole}
                onClickCard={onClickCard}
                title={dashRoles.title}
                filterList={[
                    <Filter placeholder="session | titulo" filtrar={handleInputChange}/>,
                    <Button onClick={() => { setUserRoleSelect(null); setnewRole(true)}} typeStyle="secondary" 
                    className="text-xl font-light rounded-full h-8 "><span className="text-4xl">+</span> Nova Permissão</Button>
                ]}
            />
            <ShowUserRole />
            <ShowNewRole />
        </>
    )
}

export default DashRoles