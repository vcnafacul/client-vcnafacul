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

export interface LinkMenu {
    id: number;
    text: string;
    link: string;
    internal: boolean,
    target?: string,
}

export interface Slide {
    id: number;
    title: string;
    subtitle: string;
    links: LinkMenu[];
    background_image?: string;
    image?: React.FC<React.SVGProps<SVGSVGElement>> | string;
    backgroud_color: string;
}



