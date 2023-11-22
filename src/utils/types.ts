export interface ItemCard {
    id: number;
    title: string;
    subtitle?: string;
    image: React.FC<React.SVGProps<SVGSVGElement>> | string;
}