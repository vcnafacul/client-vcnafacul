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

function HighlightSelector ( {items, changeItem, flexDirection, fontSize, justifyContent, liMargin, className } : Props) {
    const [activePosition, setActivePosition] = useState(0);

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
                        className={cssClass + className}
                        tabIndex={index}
                    >
                        {item}
                    </li>
                )
            })
        )
    }

    return (
        <ul
            className={`
            desktop h-full ulComponent w-full
            ${fontSize ?? 'text-2xl'} 
            ${flexDirection ?? "flex-row"}
            ${justifyContent ?? 'justify-around'}
            ${liMargin ?? "m-2.5"}
            ${className}
            `}
        >
            <IElements />
        </ul>
        
    );
};

export default HighlightSelector;
