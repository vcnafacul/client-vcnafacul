import { useState } from "react";

import { ReactComponent as MenuIcon } from "../../../assets/icons/menu.svg";

import Sign from "../sign";
import Logged from "../../molecules/Logged";
import Logo from "../../molecules/logo";
import MainMenu from "../mainMenu";
import { ItemMenu } from "../../molecules/menuItems";
import { SocialLink } from "../../molecules/followUs";
import { NavigationProps } from "../../atoms/dropdownMenu";
import { useAuthStore } from "../../../store/auth";
import { capitalize } from "../../../utils/capitalize";


export interface HeaderProps {
    itemsMenu: ItemMenu[]
    homeLink?: string;
    socialLinks: SocialLink;
    solid: boolean;
    className?: string;
    userNavigationSign: NavigationProps[]
    userNavigationLogged: NavigationProps[]
}

function Header({ itemsMenu, socialLinks, solid, userNavigationSign, userNavigationLogged,  className } : HeaderProps) {
    const [openMenu, setOpenMenu] = useState(false);
    const {  data: { token, user: { firstName } } } = useAuthStore()
    
    return (
        <header className={className}>
            <div className={`md:container mx-auto`}>
                <div>
                    <div className="flex justify-between items-center mx-4 md:mx-auto md:max-w-6xl ">
                        {openMenu ? <></> :
                            <div onClick={() => setOpenMenu(true) }>
                                <MenuIcon className={`${!solid ? 'fill-white' : 'fill-marine'} md:hidden`} />
                            </div>
                        }
                        <Logo solid={solid} name />
                        <MainMenu itemsMenu={itemsMenu} socialLinks={socialLinks} solid={solid} open={openMenu} 
                        handleClose={() =>{
                            setOpenMenu(false)
                        }}/>
                        {!token ?  
                            <Sign userNavigation={userNavigationSign} solid={solid} className="items-center"/> :
                            <Logged userNavigation={userNavigationLogged} userName={capitalize(firstName)} className={solid ? 'text-marine' : 'text-white'}/>
                        }
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header