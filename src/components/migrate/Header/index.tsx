import { useEffect, useState } from "react";
import { HeaderProps } from "./types"

import { ReactComponent as MenuIcon } from "../../../assets/icons/menu.svg";
import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";

import Sign from "../Sign";
import Logged from "../Logged";
import ItensMenu from "../ItensMenu";
import Logo from "../../atoms/logo";

function Header({ itemsMenu, socialLinks, solid } : HeaderProps) {
    const [backgroundSolid, setBackgroundSolid] = useState(!!solid);
    const [openMenu, setOpenMenu] = useState(false);

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
                        <div className="md:hidden">
                            {openMenu ? 
                            <div onClick={() => setOpenMenu(false)}>
                                <CloseIcon />
                            </div> : 
                            <div onClick={() => setOpenMenu(true)}>
                                <MenuIcon className={`${!backgroundSolid ? 'fill-white' : 'fill-marine'}`} />
                            </div>
                            }
                        </div>
                        <Logo solid={backgroundSolid} name />
                        <ItensMenu itemsMenu={itemsMenu} socialLinks={socialLinks} solid={backgroundSolid}
                            className={openMenu ? "z-50 md:hidden absolute top-16 left-0 h-screen w-screen" + 
                            " flex justify-center items-center flex-col bg-white" : "hidden md:inline"} />
                        {!token ?  <Sign solid={backgroundSolid} className="items-center"/>
                        :   <Logged />
                        }
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header