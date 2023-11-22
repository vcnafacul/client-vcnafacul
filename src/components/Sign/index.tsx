import { Link } from "react-router-dom"
import { SingProps } from "../Header/types"
import { LOGIN_PATH, REGISTER_PATH } from '../../routes/path'
import  { ReactComponent as UserIcon } from "../../assets/icons/user.svg";
import MenuAvatar from '../MenuAvatar'

const userNavigation = [
    { name: 'Cadastro', href: REGISTER_PATH },
    { name: 'Login', href: LOGIN_PATH },
  ]

function Sign({ solid, className }: SingProps){
    return (
        <div className={`flex ${className}`}>
            <Link to={userNavigation[0].href} 
                className={`hidden md:inline-block mr-6 text-base font-bold ${solid ? 'text-marine' : 'text-white'}`}>
                {userNavigation[0].name}
            </Link>
            <Link to={userNavigation[1].href} 
                className="hidden text-base bg-orange md:flex items-center justify-around py-1 px-3 rounded-sm">
                <UserIcon className="mr-1"/>
                {userNavigation[1].name}
            </Link>
            <MenuAvatar userNavigation={userNavigation} className="md:hidden" />
        </div>
    )
}

export default Sign