import DropdwonMenu from "../../atoms/dropdownMenu";
import Avatar from "../avatar";
import { ItemMenuProps } from "../menuItems";

interface LoggedProps {
  userName: string;
  userNavigation: ItemMenuProps[];
  className?: string;
}

function Logged({ userName, userNavigation, className }: LoggedProps) {
  return (
    <DropdwonMenu
      userNavigation={userNavigation}
      className={`${className} flex items-center font-bold text-lg`}
    >
      <div className={`${className} flex items-center font-bold text-lg`}>
          <div className="">{userName}</div>
        <Avatar />
      </div>
    </DropdwonMenu>
  );
}

export default Logged;
