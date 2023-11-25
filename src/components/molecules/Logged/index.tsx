import DropdwonMenu from "../../atoms/dropdownMenu"
import Avatar from "../avatar"

const userNavigation = [
    { name: 'DashBoard', href: "#" },
    { name: 'Editar Perfil', href: "#" },
    { name: 'Sair', href: "#" },
  ]

function Logged(){
    return (
        <div className="flex items-center">
            <div>
                Fernando
            </div>
            <DropdwonMenu userNavigation={userNavigation}>
                <Avatar />
            </DropdwonMenu>
        </div>
    )
}

export default Logged