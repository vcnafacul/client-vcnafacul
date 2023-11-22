import { useEffect, useState } from "react";
import { HeaderProps } from "./types"
import { Link } from "react-router-dom";

import { ReactComponent as MenuIcon } from "../../assets/icons/menu.svg";
import { ReactComponent as CloseIcon } from "../../assets/icons/close.svg";
import { ReactComponent as LogoIcon } from "../../assets/images/home/logo.svg";

import Sign from "../Sign";
import Logged from "../Logged";
import ItensMenu from "../ItensMenu";

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
            <div className={`fixed top-0 left-0 w-full z-50 py-4 md:py-5 px-0 ${backgroundSolid ? 'bg-marine' : 'bg-transparent'} text-white`}>
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
                        <Link to="#">
                            <div className="flex items-center">
                                <LogoIcon />
                                <div className="ml-2.5 text-lg md:text-xl">
                                    você na <strong>facul</strong>
                                </div>
                            </div>
                        </Link>
                        <ItensMenu itemsMenu={itemsMenu} socialLinks={socialLinks} 
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