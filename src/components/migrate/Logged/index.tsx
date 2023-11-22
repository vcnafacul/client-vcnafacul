import MenuAvatar from "../MenuAvatar"

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
            <MenuAvatar userNavigation={userNavigation} />
        </div>
    )
}

export default Logged