import MenuItem, { ItemMenuProps } from "../../molecules/menuItems";
import FollowUs from "../../molecules/followUs";

import { ReactComponent as CloseIcon } from "../../../assets/icons/close.svg";

interface MainMenuProps {
    itemsMenu: ItemMenuProps[]
    socialLinks: ItemMenuProps[];
    className?: string;
    solid: boolean;
    open: boolean;
    handleClose: () => void;
}

function MainMenu({ itemsMenu, socialLinks, className, solid, open, handleClose} : MainMenuProps ) {
    return (
        <div className={`${open ? 'z-10 absolute top-0 left-0 h-screen w-screen flex justify-center items-center flex-col bg-white' 
        : "hidden md:inline"} ${className}`}>
            <div onClick={handleClose}>
                <CloseIcon className={open ? 'fill-marine z-50 absolute top-6 left-6' : 'hidden'}/>
            </div>
            <MenuItem 
                itemsMenu={itemsMenu} 
                solid={solid} 
                align={open ? 'vertical' : 'horizontal'}
                className={open ? 'text-marine h-40 justify-around' : ''} />
            <FollowUs className={open ? '' : 'hidden'} socialLinks={socialLinks} solid={true}/>
        </div>
    )
}

export default MainMenu