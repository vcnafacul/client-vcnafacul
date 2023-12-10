import DropdwonMenu, { NavigationProps } from "../../atoms/dropdownMenu"
import Avatar from "../avatar"

interface LoggedProps {
    userName: string;
    userNavigation: NavigationProps[]
    className?: string;
}

function Logged({userName, userNavigation, className} : LoggedProps){
    return (
        <div className={`${className} flex items-center font-bold text-lg`}>
            <div>{userName}</div>
            <DropdwonMenu userNavigation={userNavigation}>
                <Avatar />
            </DropdwonMenu>
        </div>
    )
}

export default Logged