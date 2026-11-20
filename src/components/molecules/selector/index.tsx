import { VariantProps, tv } from "tailwind-variants";
import HighlightSelector from "../../atoms/highlightSelector"
import { OptionsSelect } from "@/components/ui/options-select"
import './styles.css'

const selector = tv({
    base: 'desktop ulComponent text-h2',
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
    activeTab: number;
}

function Selector({tabItems, changeItem, align, className, activeTab} : SelectorProps){
    return (
        <>
            <HighlightSelector className={selector({ align, className })} items={tabItems}  changeItem={changeItem} activeTab={activeTab}/>
            <div className="mobile">
                <OptionsSelect<string>
                    aria-label="Seção"
                    options={tabItems.map((item, index) => ({ value: String(index), label: item }))}
                    value={String(activeTab)}
                    onValueChange={(index) => changeItem(Number(index))}
                />
            </div>
        </>
    )
}

export default Selector