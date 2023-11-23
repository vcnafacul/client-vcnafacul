import { Link } from "react-router-dom"
import { SingProps } from "../Header/types"
import { LOGIN_PATH, REGISTER_PATH } from '../../../routes/path'
import  { ReactComponent as UserIcon } from "../../../assets/icons/user.svg";
import MenuAvatar from '../MenuAvatar'
import BLink from "../../atoms/bLink";

const userNavigation = [
    { name: 'Cadastro', href: REGISTER_PATH },
    { name: 'Login', href: LOGIN_PATH },
  ]

function Sign({ solid, className }: SingProps){
    return (
        <div className={`flex ${className}`}>
            <BLink to={userNavigation[0].href} type="tertiary" 
                className={`border-none ${solid ? 'text-marine' : 'text-white'} hover:bg-inherit hover:text-current`}>
                {userNavigation[0].name}
            </BLink>
            <BLink to={userNavigation[1].href} type="primary" size="small"
                className={`border-none hidden text-base bg-orange md:block rounded-sm hover:bg-orange hover:text-current`}>
                    <UserIcon className="mr-3 ml-0"/>
                    {userNavigation[1].name}
            </BLink>
            <MenuAvatar userNavigation={userNavigation} className="md:hidden" />
        </div>
    )
}

export default Sign