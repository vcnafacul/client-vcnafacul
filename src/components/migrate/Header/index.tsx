import { useEffect, useState } from "react";

import { ReactComponent as MenuIcon } from "../../../assets/icons/menu.svg";

import Sign, { SingProps } from "../Sign";
import Logged from "../Logged";
import Logo from "../../molecules/logo";
import { ItemMenu, SocialLink } from "../../../types/baseTemplate";
import MainMenu from "../../organisms/mainMenu";


export interface HeaderProps extends SingProps {
    itemsMenu: ItemMenu[]
    homeLink?: string;
    socialLinks: SocialLink;
}

function Header({ itemsMenu, socialLinks, solid } : HeaderProps) {
    const [backgroundSolid, setBackgroundSolid] = useState(!!solid);
    const [openMenu, setOpenMenu] = useState(false);
    console.log(`backgroundSolid ${backgroundSolid}`)

    const token = ''

    useEffect(() => {
        if (solid !== true) {
            const handleScroll = () => {
                if (window.scrollY > 150 && !backgroundSolid) {
                    setBackgroundSolid(true);
                } else if (window.scrollY <= 150 && backgroundSolid) {
                    setBackgroundSolid(false);
                }
            }

            window.addEventListener("scroll", handleScroll);

            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [backgroundSolid, solid]);

    return (
        <header className="container mx-auto">
            <div className={`fixed top-0 left-0 w-full z-50 py-4 md:py-5 px-0 ${backgroundSolid ? 'bg-white' : 'bg-transparent'} text-white`}>
                <div>
                    <div className="flex justify-between items-center mx-4 md:mx-auto md:max-w-6xl">
                        {openMenu ? <></> :
                            <div onClick={() => setOpenMenu(true) }>
                                <MenuIcon className={`${!backgroundSolid ? 'fill-white' : 'fill-marine'}`} />
                            </div>
                        }
                        <Logo solid={backgroundSolid} name />
                        <MainMenu itemsMenu={itemsMenu} socialLinks={socialLinks} solid={backgroundSolid} open={openMenu} 
                        handleClose={() =>{
                            setOpenMenu(false)
                        }}/>
                        {!token ?  
                            <Sign solid={backgroundSolid} className="items-center"/> :
                            <Logged />
                        }
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header