import DropdwonMenu, { NavigationProps } from "../../atoms/dropdownMenu"
import Avatar from "../avatar"

interface LoggedProps {
    userName: string;
    userNavigation: NavigationProps[]
}

function Logged({userName, userNavigation} : LoggedProps){
    return (
        <div className="flex items-center">
            <div>{userName}</div>
            <DropdwonMenu userNavigation={userNavigation}>
                <Avatar />
            </DropdwonMenu>
        </div>
    )
}

export default Logged