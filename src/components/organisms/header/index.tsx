import { useState } from "react";

import { ReactComponent as MenuIcon } from "../../../assets/icons/menu.svg";

import DropdwonMenu from "@/components/atoms/dropdownMenu";
import { report } from "@/pages/home/data";
import { ReactComponent as Reporticon } from "../../../assets/icons/warning.svg";
import { useBaseTemplateContext } from "../../../context/baseTemplateContext";
import { useAuthStore } from "../../../store/auth";
import { capitalize } from "../../../utils/capitalize";
import { SocialLink } from "../../molecules/followUs";
import Logged from "../../molecules/Logged";
import Logo from "../../molecules/logo";
import { ItemMenuProps } from "../../molecules/menuItems";
import MainMenu from "../mainMenu";
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

  const { header } = useBaseTemplateContext();

  const MenuBugger = () => {
    if (openMenu) return null;
    return (
      <div onClick={() => setOpenMenu(true)} className="md:hidden">
        <MenuIcon className={`${!solid ? "fill-white" : "fill-marine"}`} />
      </div>
    );
  };

  return (
    <header className={className} id="header">
      <div className="md:container mx-auto h-full flex items-center">
        <div className="flex w-full justify-between items-center mx-4 md:mx-auto md:max-w-6xl">
          <MenuBugger />
          <Logo solid={solid} name />
          <MainMenu
            itemsMenu={header.pageLinks}
            socialLinks={header.socialLinks}
            solid={solid}
            open={openMenu}
            handleClose={() => {
              setOpenMenu(false);
            }}
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
              userName={capitalize(useSocialName ? socialName! : firstName)}
              className={solid ? "text-marine" : "text-white"}
            />
          )}
        </div>
        <DropdwonMenu userNavigation={report}>
          <Reporticon className="hidden sm:block w-8 h-8" />
        </DropdwonMenu>
      </div>
    </header>
  );
}

export default Header;
