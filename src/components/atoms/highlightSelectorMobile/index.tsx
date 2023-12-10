import { useState } from "react";

interface Props {
    items: string[];
    changeItem: (index: number) => void;
    flexDirection?: string;
    fontSize?: string;
    justifyContent?: string;
    liMargin?: string;
    className?: string;
}

const HighlightSelectorMobile = (props : Props) => {
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
        <div className="mobile text-marine text-lg">
            <div className="w-full flex justify-center">
                {apparentItem()}
            </div>
            <ul 
                className={`mobileDropdown ${showDropdown ? "visible" : "invisible"}`}>
                <HiddenItems />
            </ul>
        </div>
    );
};

export default HighlightSelectorMobile;
