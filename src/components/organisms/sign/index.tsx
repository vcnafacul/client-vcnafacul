import { ReactComponent as UserIcon } from "../../../assets/icons/user.svg";
import { Button } from "@/components/ui/button";
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
            <Button asChild variant="ghost" size="sm"
                className={solid ? 'text-foreground' : 'text-white hover:bg-white/10 hover:text-white'}>
                <Link to={userNavigation[0].Home_Menu_Item_id.link}>
                    {userNavigation[0].Home_Menu_Item_id.name}
                </Link>
            </Button>
            <Button asChild size="sm" className="hidden md:inline-flex">
                <Link to={userNavigation[1].Home_Menu_Item_id.link}>
                    <UserIcon aria-hidden="true" />
                    {userNavigation[1].Home_Menu_Item_id.name}
                </Link>
            </Button>
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