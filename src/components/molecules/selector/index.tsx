import HighlightSelector from "../../atoms/highlightSelector"
import MobileDropdownDiv from "../../atoms/mobileDropdownDiv"

interface SelectorProps {
    tabItems: string[];
    changeItem: (index: number) => void;
}

function Selector({tabItems, changeItem} : SelectorProps){
    return (
        <>
            <HighlightSelector className="md:w-full flex justify-center" items={tabItems} fontSize="text-base" changeItem={changeItem} justifyContent="justify-center" liMargin="m-0" />
            <MobileDropdownDiv className="actionAreasMobileDropdown" items={tabItems} changeItem={changeItem} />
        </>
    )
}

export default Selector