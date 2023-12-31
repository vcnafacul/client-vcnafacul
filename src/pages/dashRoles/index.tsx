/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react"
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import { dashRoles } from "./data"
import { getRoles } from "../../services/roles/getRoles"
import { useAuthStore } from "../../store/auth"
import { Role } from "../../types/roles/role"
import { toast } from "react-toastify"
import { UserRole } from "../../types/roles/UserRole"
import { getUsersRole } from "../../services/roles/getUsersRole"
import { CardDashInfo } from "../../components/molecules/cardDash"
import { StatusEnum } from "../../enums/generic/statusEnum"
import ModalRole from "./modals/ModalRole"
import { updateRole } from "../../services/roles/updateRole"
import ModalNewRole from "./modals/ModalNewRole"
import Button from "../../components/molecules/button"
import Filter from "../../components/atoms/filter"
import ShowUserInfo from "./modals/showUserInfo"

function DashRoles(){
    const [roles, setRoles] = useState<Role[]>([])
    const [usersRole, setUsersRole]= useState<UserRole[]>([])
    const [userRoleSelect, setUserRoleSelect] = useState<UserRole | null>()
    const [userModal, setUserModal] = useState<boolean>(false);
    const [userRoleModal, setUserRoleModal] = useState<boolean>(false);
    const [newRole, setnewRole] = useState<boolean>(false);
    const dataRef = useRef<UserRole[]>([])

    const { data: { token }} = useAuthStore()

    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setUsersRole(dataRef.current)
        else setUsersRole(
            dataRef.current.filter(
                q => q.user.firstName.toLowerCase().includes(filter) || 
                q.user.lastName.toLowerCase().includes(filter) || 
                q.roleName.toLowerCase().includes(filter)))
    }

    const cardUserRole : CardDashInfo[] = usersRole.map(ur => (
        {cardId: ur.user.id, title: ur.user.firstName + " " + ur.user.lastName, 
        status: ur.user.deletedAt ? StatusEnum.Rejected : StatusEnum.Approved, infos: 
            [
                { field:"Email", value: ur.user.email },
                { field:"Telefone", value: ur.user.phone },
                { field:"Permissao", value: ur.roleName},
            ]
        }
    ))

    const onClickCard = (userId: number | string) => {
        setUserRoleSelect(usersRole.find(user => user.user.id === userId))
        setUserModal(true)
    }

    const updateUserRole = (userRole: UserRole) => {
        setUserRoleModal(false)
        updateRole(userRole.user.id, userRole.roleId, token)
            .then(_ => {
                setUsersRole(usersRole.map(ur => {
                    if(ur.user.id === userRole.user.id) {
                        userRole.user.updatedAt = new Date()
                        setUserRoleSelect(userRole)
                        return userRole
                    }
                    return ur
                }))
                toast.success(`Atualização da permissão do usuário  ${userRole.user.firstName} feita com sucesso`)
            })
            .catch((error: Error) => {
                toast.error(`${error.message} - Usuário ${userRole.user.firstName}`)
            })
    }

    const updateUserLocal = (ur: UserRole) => {
        const newUserRole = usersRole.map(user => {
            if(user.user.id === ur.user.id){
                return ur
            }
            return user
        })
        setUsersRole(newUserRole)
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
                setUsersRole(res.sort((a, b) => a.user.firstName.localeCompare(b.user.firstName)))
                dataRef.current = res;
            })
            .catch((error: Error) => {
                toast.error(error.message)
                setUsersRole([])
            })

    }, [token])

    const ShowUserRole = () => {
        if(!userRoleModal) return null
        return <ModalRole 
            roles={roles.filter(r => { if(r.name !== 'Todos'){ return r}})} 
            updateUserRole={updateUserRole}
            userRole={userRoleSelect!}
            handleClose={() => setUserRoleModal(false)} />
    }

    const ShowNewRole = () => {
        if(!newRole) return null
        return <ModalNewRole handleClose={() => setnewRole(false)} />
    }

    const ShowUserModal = () => {
        if(!userModal) return null
        return <ShowUserInfo 
        ur={userRoleSelect!} 
        updateUser={updateUserLocal}
        openUpdateRole={() => setUserRoleModal(true)}
        handleClose={() => setUserModal(false)}
         />
    }
    
    return (
        <>
            <DashCardTemplate
                cardlist={cardUserRole}
                onClickCard={onClickCard}
                title={dashRoles.title}
                filterList={[
                    <Filter placeholder="session | titulo" filtrar={handleInputChange}/>,
                    <Button onClick={() => { setUserRoleSelect(null); setnewRole(true)}} typeStyle="quaternary"
                    className="text-xl font-light rounded-full h-8 "><span className="text-4xl">+</span> Nova Permissão</Button>
                ]}
            />
            <ShowUserModal />
            <ShowUserRole />
            <ShowNewRole />
        </>
    )
}

export default DashRoles