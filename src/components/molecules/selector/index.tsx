import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { OptionsSelect } from "@/components/ui/options-select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import './styles.css'

// D17: as seções trocam o conteúdo da página, então no desktop são abas (`Tabs`).
// O conteúdo mora no pai; aqui só as abas e o valor ativo.
const selector = cva(
  'justify-center',
  {
    variants: {
        align: {
            horizontal: 'flex-wrap',
            vertial: 'h-auto flex-col items-stretch justify-between border-b-0'
        },
    },
    defaultVariants: {
        align: 'horizontal'
    }
  }
)

export type SelectorProps = VariantProps<typeof selector> & {
    tabItems: string[];
    changeItem: (index: number) => void;
    className?: string;
    activeTab: number;
}

function Selector({tabItems, changeItem, align, className, activeTab} : SelectorProps){
    return (
        <>
            <Tabs
                className="desktop"
                value={String(activeTab)}
                onValueChange={(index) => changeItem(Number(index))}
                orientation={align === 'vertial' ? 'vertical' : 'horizontal'}
            >
                <TabsList aria-label="Seção" className={cn(selector({ align }), className)}>
                    {tabItems.map((item, index) => (
                        <TabsTrigger key={index} value={String(index)}>
                            {item}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
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
