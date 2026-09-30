import DropdwonMenu from "../../atoms/dropdownMenu";
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
  return (
    <DropdwonMenu
      userNavigation={instalavel ? comInstalarApp(userNavigation) : userNavigation}
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
