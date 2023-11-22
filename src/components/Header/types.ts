export interface MenuContainerProps {
    open?: string;
}

export interface MenuItemProps {
    color1200?: string;
    solid?: boolean
}

export interface DesktopDropdownMenuProps
    extends MenuContainerProps, MenuItemProps {
        fill?: string;
        backgroung?: string;
        boxshadow?: string;
        display?: string;
    }

export interface BrandProps 
    extends MenuContainerProps {
        color: string;
        color1200: string;
}

export interface ItemMenu {
    id: number;
    name: string;
    link: string;
    internal?: boolean;
}

export interface SocialLink {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
}

export interface SingProps {
    solid: boolean;
    className?: string;
}

export interface HeaderProps extends SingProps {
    itemsMenu: ItemMenu[]
    homeLink?: string;
    socialLinks: SocialLink;
}