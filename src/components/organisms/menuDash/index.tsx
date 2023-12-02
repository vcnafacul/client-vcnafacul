import { useState } from "react";
import DashCard from "../../molecules/dashCard";
import { dashCardMenuItems } from "../../../pages/dash/data";

function MenuDash() {
    const [opened, setOpened] = useState<number>(0)

    const selectCard = (cardId: number) => {
        setOpened(opened === cardId ? 0 : cardId)
    }

    return (
        <div className="hidden md:block md:fixed top-[76px] right-0 bg-white shadow-md p-2 w-60 h-full">
        {dashCardMenuItems.map(card => (
               <DashCard onClick={() => { selectCard(card.id)}} key={card.id} card={card} opened={opened === card.id} size={`${opened === card.id || opened === 0 ? 'big' : 'small'}`} />
            ))}
       </div>
    )
}

export default MenuDash