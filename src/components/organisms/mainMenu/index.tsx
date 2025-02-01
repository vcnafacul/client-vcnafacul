import FollowUs from "../../molecules/followUs";
import MenuItem, { ItemMenuProps } from "../../molecules/menuItems";

import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";

interface MainMenuProps {
  itemsMenu: ItemMenuProps[];
  socialLinks: ItemMenuProps[];
  className?: string;
  solid: boolean;
  open: boolean;
  handleClose: () => void;
}

function MainMenu({
  itemsMenu,
  className,
  solid,
  open,
  handleClose,
}: MainMenuProps) {
  return (
    <div
      className={`${
        open
          ? "z-10 absolute top-0 left-0 h-screen w-screen flex justify-center items-center flex-col bg-white"
          : "hidden md:inline"
      } ${className}`}
    >
      <div onClick={handleClose}>
        <CloseIcon
          className={open ? "fill-marine z-50 absolute top-6 left-6" : "hidden"}
        />
        <MenuItem
          itemsMenu={itemsMenu}
          solid={solid}
          align={open ? "vertical" : "horizontal"}
          className={open ? "text-marine" : ""}
        />
        <div className="flex flex-col gap-2 my-2 sm:hidden">
          <a href="https://github.com/orgs/vcnafacul/discussions/new?category=problemas" target="_blank" className="text-lg font-black text-marine text-center">
            Relatar um Problema
          </a>
          <a href="https://github.com/orgs/vcnafacul/discussions/new?category=ideas" target="_blank" className="text-lg font-black text-marine text-center">
            Propor uma ideia
          </a>
        </div>
        <FollowUs className={open ? "" : "hidden"} solid={true} />
      </div>
    </div>
  );
}

export default MainMenu;
