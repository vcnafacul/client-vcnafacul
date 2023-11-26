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
}

function Header({ itemsMenu, socialLinks, solid } : HeaderProps) {
    const [openMenu, setOpenMenu] = useState(false);
    
    const token = ''

    return (
        <header className={`container mx-auto`}>
            <div className={`fixed top-0 left-0 w-full z-50 py-4 md:py-5 px-0 text-white ${solid ? 'bg-white' : 'bg-transparent'}`}>
                <div>
                    <div className="flex justify-between items-center mx-4 md:mx-auto md:max-w-6xl">
                        {openMenu ? <></> :
                            <div onClick={() => setOpenMenu(true) }>
                                <MenuIcon className={`${!solid ? 'fill-white' : 'fill-marine'}`} />
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