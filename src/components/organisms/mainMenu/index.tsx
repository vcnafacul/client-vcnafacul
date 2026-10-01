import MenuItem, { ItemMenuProps } from "../../molecules/menuItems";

interface MainMenuProps {
  itemsMenu: ItemMenuProps[];
  className?: string;
  solid: boolean;
}

/**
 * Os links do header no desktop (`md` pra cima). Abaixo disso quem mostra os
 * links é o `MenuMobile`, aberto pelo botão de menu.
 */
function MainMenu({ itemsMenu, className, solid }: MainMenuProps) {
  return (
    <div className={`hidden md:inline ${className ?? ""}`}>
      <MenuItem itemsMenu={itemsMenu} solid={solid} align="horizontal" />
    </div>
  );
}

export default MainMenu;
