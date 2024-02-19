import { useState } from "react";

import { ReactComponent as MenuIcon } from "../../../assets/icons/menu.svg";

import { useBaseTemplateContext } from "../../../context/baseTemplateContext";
import { useAuthStore } from "../../../store/auth";
import { capitalize } from "../../../utils/capitalize";
import Logged from "../../molecules/Logged";
import Logo from "../../molecules/logo";
import { ItemMenuProps } from "../../molecules/menuItems";
import MainMenu from "../mainMenu";
import Sign from "../sign";

export interface HeaderProps {
    solid: boolean;
    className?: string;
    pageLinks: ItemMenuProps[]
    socialLinks: ItemMenuProps[];
    userNavigationSign: ItemMenuProps[]
    userNavigationLogged: ItemMenuProps[]
}

function Header({ solid, className } : HeaderProps) {
    const [openMenu, setOpenMenu] = useState(false);
    const {  data: { token, user: { firstName } } } = useAuthStore()

    const { header } = useBaseTemplateContext()
 
    const MenuBugger = () => {
        if(openMenu) return null
        return (
            <div onClick={() => setOpenMenu(true) } className="md:hidden">
                <MenuIcon className={`${!solid ? 'fill-white' : 'fill-marine'}`} />
            </div> 
        )
    }
    
    return (
        <header className={className}>
            <div className='md:container mx-auto'>
                <div>
                    <div className="flex justify-between items-center mx-4 md:mx-auto md:max-w-6xl ">
                        <MenuBugger />
                        <Logo solid={solid} name />
                        <MainMenu itemsMenu={header.pageLinks} socialLinks={header.socialLinks} solid={solid} open={openMenu} 
                        handleClose={() =>{
                            setOpenMenu(false)
                        }}/>
                        {!token ?  
                            <Sign userNavigation={header.userNavigationSign} solid={solid} className="items-center"/> :
                            <Logged userNavigation={header.userNavigationLogged} userName={capitalize(firstName)} className={solid ? 'text-marine' : 'text-white'}/>
                        }
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header