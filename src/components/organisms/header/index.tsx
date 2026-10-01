import { useCallback, useState } from "react";

import { ReactComponent as MenuIcon } from "../../../assets/icons/menu.svg";

import DropdwonMenu from "@/components/atoms/dropdownMenu";
import { report } from "@/pages/homeLegacy/data";
import { ReactComponent as Reporticon } from "../../../assets/icons/warning.svg";
import { useBaseTemplateContext } from "../../../context/baseTemplateContext";
import { useAuthStore } from "../../../store/auth";
import { capitalize } from "../../../utils/capitalize";
import { SocialLink } from "../../molecules/followUs";
import Logged from "../../molecules/Logged";
import Logo from "../../molecules/logo";
import { ItemMenuProps } from "../../molecules/menuItems";
import MainMenu from "../mainMenu";
import MenuMobile from "../menuMobile";
import Sign from "../sign";

export interface HeaderData {
  pageLinks: ItemMenuProps[];
  socialLinks: SocialLink[];
  userNavigationSign: ItemMenuProps[];
  userNavigationLogged: ItemMenuProps[];
}

interface HeaderProps {
  solid: boolean;
  className?: string;
}

function Header({ solid, className }: HeaderProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const {
    data: {
      token,
      user: { firstName, socialName, useSocialName },
    },
  } = useAuthStore();

  const { header, headerAction } = useBaseTemplateContext();
  const fecharMenu = useCallback(() => setOpenMenu(false), []);
  const nome = token
    ? capitalize(useSocialName ? socialName! : firstName)
    : undefined;

  return (
    // ⚠️ `print:hidden`: o relatório do simulado é impresso, e a folha
    // impressa não carrega o header do site — não faz sentido no papel e
    // rouba espaço do que o coordenador quer imprimir.
    <header className={`${className ?? ""} print:hidden`} id="header">
      <div className="md:container mx-auto h-full flex items-center">
        <div className="flex w-full justify-between items-center mx-4 md:mx-auto md:max-w-6xl">
          {/* Com `headerAction` (o botão do menu lateral do dashboard, #837)
              o ☰ do site sai: dois botões de menu no mesmo header confundem. */}
          {!headerAction && (
            <button
              type="button"
              onClick={() => setOpenMenu(true)}
              aria-label="Abrir menu do site"
              aria-expanded={openMenu}
              className="md:hidden -ml-2 p-2"
            >
              <MenuIcon className={`${!solid ? "fill-white" : "fill-marine"}`} />
            </button>
          )}
          <Logo solid={solid} name />
          <MainMenu itemsMenu={header.pageLinks} solid={solid} />
          <MenuMobile
            open={openMenu}
            onClose={fecharMenu}
            itens={header.pageLinks}
            // O 4º item dos dados repete o link do Facebook (com ícone do
            // Twitter): só um ícone por endereço.
            redes={header.socialLinks.filter(
              (rede, i, todas) =>
                todas.findIndex(
                  (r) => r.Home_Menu_Item_id.link === rede.Home_Menu_Item_id.link,
                ) === i,
            )}
            entrar={token ? undefined : header.userNavigationSign[1]}
            cadastrar={token ? undefined : header.userNavigationSign[0]}
            nome={nome}
          />
          {!token ? (
            <Sign
              userNavigation={header.userNavigationSign}
              solid={solid}
              className="items-center gap-2"
            />
          ) : (
            <Logged
              userNavigation={header.userNavigationLogged}
              userName={nome!}
              className={solid ? "text-marine" : "text-white"}
            />
          )}
        </div>
        <DropdwonMenu userNavigation={report}>
          <Reporticon className="hidden sm:block w-8 h-8" />
        </DropdwonMenu>
        {headerAction}
      </div>
    </header>
  );
}

export default Header;
