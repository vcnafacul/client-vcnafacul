import { VariantProps, tv } from "tailwind-variants";
import HighlightSelector from "../../atoms/highlightSelector"
import HighlightSelectorMobile from "../../atoms/highlightSelectorMobile"
import './styles.css'

const selector = tv({
    base: 'desktop ulComponent text-xl',
    variants: {
        align: {
            horizontal: 'justify-center',
            vertial: 'flex-col justify-between'
        },
    },
    defaultVariants: {
        align: 'horizontal'
    }
})

export type SelectorProps = VariantProps<typeof selector> & {
    tabItems: string[];
    changeItem: (index: number) => void;
    className?: string;
    activetab: number;
}

function Selector({tabItems, changeItem, align, className, activetab} : SelectorProps){
    return (
        <>
            <HighlightSelector className={selector({ align, className })} items={tabItems}  changeItem={changeItem} activetab={activetab}/>
            <HighlightSelectorMobile className="actionAreasMobileDropdown" items={tabItems} changeItem={changeItem} />
        </>
    )
}

export default Selector