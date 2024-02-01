import { useState } from "react";
import DashCard from "../../molecules/dashCard";
import { dashCardMenuItems } from "../../../pages/dash/data";
import { ReactComponent as MenuIcon } from '../../../assets/icons/menu.svg'

function MenuDash() {
    const [opened, setOpened] = useState<number>(0)
    const [openMenu, setOpenMenu] = useState<boolean>(false)

    const selectCard = (cardId: number) => {
        setOpened(opened === cardId ? 0 : cardId)
    }

    const openedMenu = () => {
        if(openMenu) {
            return '-right-0'
        }
        return '-right-[246px]'
    }

    return (
        <div className={`fixed md:block top-[76px] md:right-0 bg-white shadow-2xl p-2 w-72 md:w-64 h-full flex justify-end gap-2 ${openedMenu()} transition-all duration-200`}>
            <MenuIcon className="mt-4 cursor-pointer md:hidden" onClick={() => { setOpenMenu(!openMenu)}}/>
            <div className="w-60">
                {dashCardMenuItems.map(card => (
                    <DashCard onClick={() => { selectCard(card.id)}} key={card.id} card={card} opened={opened === card.id} size={`${opened === card.id || opened === 0 ? 'big' : 'small'}`} />
                    ))}
            </div>
       </div>
    )
}

export default MenuDash