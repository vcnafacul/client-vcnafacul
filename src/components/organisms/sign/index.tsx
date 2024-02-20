import  { ReactComponent as UserIcon } from "../../../assets/icons/user.svg";
import BLink from "../../molecules/bLink";
import DropdwonMenu from '../../atoms/dropdownMenu';
import Avatar from '../../molecules/avatar';
import { ItemMenuProps } from "../../molecules/menuItems";

export interface SingProps {
    solid: boolean;
    className?: string;
    userNavigation: ItemMenuProps[]
}

function Sign({ solid, className, userNavigation }: SingProps){
    return (
        <div className={`flex ${className}`}>
            <BLink to={userNavigation[0].Home_Menu_Item_id.link} type="tertiary" size="small"
                className={`border-none ${solid ? 'text-marine' : 'text-white'}`}>
                {userNavigation[0].Home_Menu_Item_id.name}
            </BLink>
            <BLink to={userNavigation[1].Home_Menu_Item_id.link} type="primary" size="small"
                className={`border-none hidden text-base md:flex md:justify-center md:items-center rounded-sm`}>
                    <UserIcon className="mr-3 ml-0"/>
                    {userNavigation[1].Home_Menu_Item_id.name}
            </BLink>
            <DropdwonMenu userNavigation={userNavigation} className="md:hidden">
                <Avatar />
            </DropdwonMenu>
        </div>
    )
}

export default Sign