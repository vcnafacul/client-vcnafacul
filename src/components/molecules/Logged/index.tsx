import DropdwonMenu from "../../atoms/dropdownMenu"
import Avatar from "../avatar"
import { ItemMenuProps } from "../menuItems";

interface LoggedProps {
    userName: string;
    userNavigation: ItemMenuProps[]
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