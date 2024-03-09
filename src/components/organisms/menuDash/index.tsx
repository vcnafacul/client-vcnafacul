import { useState } from "react";
import { ReactComponent as MenuIcon } from '../../../assets/icons/menu.svg';
import { dashCardMenuItems } from "../../../pages/dash/data";
import DashCard from "../../molecules/dashCard";

interface MenuDashProps {
  onMenuToggle: () => void
}

function MenuDash({ onMenuToggle} : MenuDashProps) {
    const [opened, setOpened] = useState<number>(0)


    const selectCard = (cardId: number) => {
        setOpened(opened === cardId ? 0 : cardId)
    }

    return (
        <div className={`bg-white shadow-2xl p-4 h-full flex justify-start gap-4`}>
            <MenuIcon className="w-8 mt-4 cursor-pointer md:hidden" onClick={onMenuToggle}/>
            <div className="flex flex-col w-60 overflow-y-scroll scrollbar-hide pb-4">
                {dashCardMenuItems.map(card => (
                    <DashCard onClick={() => { selectCard(card.id)}} 
                        key={card.id} card={card} 
                        opened={opened === card.id} 
                        size={`${opened === card.id || opened === 0 ? 'big' : 'small'}`}/>
                    ))}
            </div>
       </div>
    )
}

export default MenuDash
