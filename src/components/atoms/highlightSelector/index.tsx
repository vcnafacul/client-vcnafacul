import { useState } from "react";

interface Props {
    items: string[];
    changeItem: (index: number) => void;
    className?: string;
    activetab: number;
}

function HighlightSelector ( {items, changeItem, className, activetab } : Props) {
    const [activePosition, setActivePosition] = useState(activetab);

    function IElements() {
        let cssClass = null;
        return (
            items.map((item, index) => {
                cssClass = activePosition === index ? "chosen " : "normal ";
                return (
                    <li 
                        key={index}
                        onClick={() => {
                            changeItem(index)
                            setActivePosition(index)
                        }}
                        className={cssClass}
                        tabIndex={index}
                    >
                        {item}
                    </li>
                )
            })
        )
    }

    return (
        <ul className={className}>
            <IElements />
        </ul>
        
    );
}

export default HighlightSelector;
