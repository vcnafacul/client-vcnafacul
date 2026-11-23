import { ReactComponent as UserIcon } from "../../../assets/icons/user.svg";
import BLink from "../../molecules/bLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import Avatar from '../../molecules/avatar';
import { ItemMenuProps } from "../../molecules/menuItems";

export interface SingProps {
    solid: boolean;
    className?: string;
    userNavigation: ItemMenuProps[]
}

function Sign({ solid, className, userNavigation }: SingProps) {
    return (
        <div className={`flex ${className}`}>
            <BLink to={userNavigation[0].Home_Menu_Item_id.link} type="tertiary" size="small"
                className={`border-none ${solid ? 'text-foreground' : 'text-white'}`}>
                {userNavigation[0].Home_Menu_Item_id.name}
            </BLink>
            <BLink to={userNavigation[1].Home_Menu_Item_id.link} type="primary" size="small"
                className={`border-none hidden text-body md:flex md:justify-center md:items-center rounded-sm`}>
                <UserIcon className="mr-3 ml-0" />
                {userNavigation[1].Home_Menu_Item_id.name}
            </BLink>
            <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        aria-label="Menu do usuário"
                        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Avatar />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {userNavigation.map((item, index) =>
                          item.Home_Menu_Item_id.onClick ? (
                            // tickets/029: item de AÇÃO (ex.: "Instalar app"), não link.
                            <DropdownMenuItem key={index} onSelect={item.Home_Menu_Item_id.onClick}>
                              {item.Home_Menu_Item_id.name}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem key={index} asChild>
                              <Link to={item.Home_Menu_Item_id.link} target={item.Home_Menu_Item_id.target}>
                                {item.Home_Menu_Item_id.name}
                              </Link>
                            </DropdownMenuItem>
                          ),
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

export default Sign