import { VariantProps, tv } from "tailwind-variants"
import { Link } from "react-router-dom";

const menuItem = tv({
    base: 'flex',
    variants: {
        align: {
            horizontal: 'flex-row md:mx-6',
            vertical: 'flex-col mb-2'
        },
        solid: {
            true: 'text-marine',
            false: 'text-white'
        }
    },
    defaultVariants: {
        align: 'horizontal',
        solid: false
    }
})

export interface ItemMenu {
    id: number;
    name: string;
    link: string;
    internal?: boolean;
}

type MenuItemProps = VariantProps<typeof menuItem> & {
    className?: string;
    itemsMenu: ItemMenu[],
    solid: boolean;
}

function MenuItem({ align, itemsMenu, className, solid } : MenuItemProps) {
    return (
        <div className={menuItem({ align, solid, className })}>
            {itemsMenu.map(link => (
                <a className="text-xl font-bold md:text-base md:font-medium mx-6 my-3"
                    key={link.id} href={link.link}>{link.name}
                </a>
            ))}
        </div>
    )
}

export default MenuItem