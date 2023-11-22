export interface LinkMenu {
    id: number;
    text: string;
    link: string;
    internal: boolean,
    target?: string,
}

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    links: LinkMenu[]
    background_image?: string,
    image?: React.FC<React.SVGProps<SVGSVGElement>> | string
}

export interface HeroProps {
    slides: Slide[]
}