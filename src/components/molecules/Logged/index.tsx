import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { instalar, useEstadoDaInstalacao } from "@/pwa/instalacao";
import Avatar from "../avatar";
import { ItemMenuProps } from "../menuItems";

interface LoggedProps {
  userName: string;
  userNavigation: ItemMenuProps[];
  className?: string;
}

/**
 * tickets/029, R7: "Instalar app" só quando o navegador oferece (celular ou
 * desktop) — para quem adiou o banner e mudou de ideia. Entra antes de "Sair".
 */
const INSTALAR_APP: ItemMenuProps = {
  Home_Menu_Item_id: {
    id: 90,
    name: "Instalar app",
    link: "",
    target: "_self",
    onClick: () => void instalar(),
  },
};

function comInstalarApp(itens: ItemMenuProps[]): ItemMenuProps[] {
  const sair = itens.findIndex((i) => i.Home_Menu_Item_id.name === "Sair");
  if (sair === -1) return [...itens, INSTALAR_APP];
  return [...itens.slice(0, sair), INSTALAR_APP, ...itens.slice(sair)];
}

function Logged({ userName, userNavigation, className }: LoggedProps) {
  const instalavel = useEstadoDaInstalacao() === "instalavel";
  const itensDoMenu = instalavel ? comInstalarApp(userNavigation) : userNavigation;
  return (
    <div className={`${className} flex items-center font-bold text-h3`}>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className={`${className} flex items-center font-bold text-h3`}>
            <div className="">{userName}</div>
            <Avatar />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {itensDoMenu.map((item, index) =>
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
  );
}

export default Logged;
