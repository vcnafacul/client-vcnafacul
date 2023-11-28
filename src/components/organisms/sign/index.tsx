import  { ReactComponent as UserIcon } from "../../../assets/icons/user.svg";
import BLink from "../../molecules/bLink";
import DropdwonMenu, { NavigationProps } from '../../atoms/dropdownMenu';
import Avatar from '../../molecules/avatar';

export interface SingProps {
    solid: boolean;
    className?: string;
    userNavigation: NavigationProps[]
}

function Sign({ solid, className, userNavigation }: SingProps){
    return (
        <div className={`flex ${className}`}>
            <BLink to={userNavigation[0].href} type="tertiary" size="small"
                className={`border-none ${solid ? 'text-marine' : 'text-white'}`}>
                {userNavigation[0].name}
            </BLink>
            <BLink to={userNavigation[1].href} type="primary" size="small"
                className={`border-none hidden text-base md:block rounded-sm`}>
                    <UserIcon className="mr-3 ml-0"/>
                    {userNavigation[1].name}
            </BLink>
            <DropdwonMenu userNavigation={userNavigation} className="md:hidden">
                <Avatar />
            </DropdwonMenu>
        </div>
    )
}

export default Sign