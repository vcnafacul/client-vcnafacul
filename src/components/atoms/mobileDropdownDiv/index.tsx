import { useState } from "react";
import './styles.css'

interface Props {
    items: string[];
    changeItem: (index: number) => void;
    flexDirection?: string;
    fontSize?: string;
    justifyContent?: string;
    liMargin?: string;
    className?: string;
}

const MobileDropdownDiv = (props : Props) => {
    const [activePosition, setActivePosition] = useState(0);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);


    const apparentItem = () => {
        return (
            <div className={`chosenMobileItem mb-2`}
                style={{transform: ` ${showDropdown ? "translateY(-45%)" : "translateY(-50%)"}`}}
                onClick={() => {
                    setShowDropdown(!showDropdown);
                }}
            >
                {props.items[activePosition]}
            </div>
        )
    }

    function HiddenItems(){
        return (
            props.items.map((item, index) => {
                if(activePosition !== index) {
                    return (
                        <li onClick={() => {
                                props.changeItem(index)
                                setActivePosition(index)
                                setShowDropdown(!showDropdown);
                            }}
                            key={index}
                            tabIndex={index}
                            className="normal">
                            {item}
                        </li>
                    )
                }
            })
        )
    }

    
    return (
        <div className="mobileDropdownDivStyle z-50 text-marine w-full relative text-lg">
            {apparentItem()}
            <ul 
                className={`mobileDropdown ${showDropdown ? "visible" : "invisible"}`}>
                <HiddenItems />
            </ul>
        </div>
    );
};

export default MobileDropdownDiv;
