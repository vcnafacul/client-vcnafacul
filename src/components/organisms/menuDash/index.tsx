import { useState } from "react";
import DashCard from "../../molecules/dashCard";

interface SubMenu {
    icon: string;
    alt: string;
    text: string;
    link: string;
    permission?: string;
}

export interface DashCardMenu { 
    id: number;
    bg: string;
    title: string;
    image: string;
    alt: string;
    subMenuList: SubMenu[]
}

interface MenuDashProps {
    dashCardList: DashCardMenu[]
}

function MenuDash({ dashCardList } : MenuDashProps) {
    const [opened, setOpened] = useState<number>(0)
    return (
        <div className="fixed top-[76px] right-0 bg-white shadow-md p-2 w-60 h-full">
        {dashCardList.map(card => (
               <DashCard key={card.id} card={card} opened={opened === card.id} size={`${opened === card.id || opened === 0 ? 'big' : 'small'}`} />
            ))}
       </div>
    )
}

export default MenuDash