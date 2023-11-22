import { ItemCard } from "../../utils/types";

export interface CardItem {
    id: number,
    items: ItemCard[]
}

export interface ActionAreas{
    title: string;
    subtitle: string;
    tabItems: string[];
    cardItems: CardItem[]
}