import { VariantProps, tv } from "tailwind-variants"
import { DashCardMenu } from "../../organisms/menuDash"
import { IoChevronDownCircleSharp, IoChevronUpCircleSharp } from "react-icons/io5";

const dashCard = tv({
    base: 'text-white py-3 px-2 flex items-center relative',
    variants: {
        size: {
            big: 'flex-col justify-between h-32 mt-4',
            small: 'flex-row justify-between gap-4 h-16 px-4'
        }
    },
    defaultVariants: {
        size: 'big'
    }
})
//criar logica para fechado e aberto no tv
type DasCardProps = VariantProps<typeof dashCard> & {
    card: DashCardMenu
    opened: boolean;
}

function DashCard({card, size, opened } : DasCardProps){
 return (
    <div 
        className={`${dashCard({ size })} ${card.bg} ${size !== 'small' && !opened ? 'mt-4 rounded-t-md' : 'mt-0'}`}>
            <img src={card.image} alt={card.alt} className={`${size !== 'small' ? 'w-14 h-14' : 'w-4 h-4'}`} />
            <div className={`${size !== 'small' ? 'flex justify-center w-full' : ''}`}>
                {card.title}
            </div>
            <IoChevronDownCircleSharp size={20} 
            className={`${size !== 'small' ? 'absolute right-3 bottom-3' : ''}`} />
    </div>
    )
}

export default DashCard