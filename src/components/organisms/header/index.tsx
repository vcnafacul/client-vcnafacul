import { useState } from "react";

import { ReactComponent as MenuIcon } from "../../../assets/icons/menu.svg";

import Sign from "../sign";
import Logged from "../../molecules/Logged";
import Logo from "../../molecules/logo";
import { ItemMenu, SocialLink } from "../../../types/baseTemplate";
import MainMenu from "../mainMenu";


export interface HeaderProps {
    itemsMenu: ItemMenu[]
    homeLink?: string;
    socialLinks: SocialLink;
    solid: boolean;
    className?: string;
}

function Header({ itemsMenu, socialLinks, solid, className } : HeaderProps) {
    const [openMenu, setOpenMenu] = useState(false);
    const token = ''
    return (
        <header className={className + 'w-screen shadow-lg'}>
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
                            <Sign solid={solid} className="items-center"/> :
                            <Logged />
                        }
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header