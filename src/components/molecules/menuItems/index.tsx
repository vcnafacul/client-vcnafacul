import { VariantProps, tv } from "tailwind-variants"
import { ItemMenu } from "../../../types/baseTemplate";
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

type MenuItemProps = VariantProps<typeof menuItem> & {
    className?: string;
    itemsMenu: ItemMenu[],
    solid: boolean;
}

function MenuItem({ align, itemsMenu, className, solid } : MenuItemProps) {
    return (
        <div className={menuItem({ align, solid, className })}>
            {itemsMenu.map(link => (
                <Link className="text-xl font-bold md:text-base md:font-medium mx-6 my-3"
                    key={link.id} to={link.link}>{link.name}
                </Link>
            ))}
        </div>
    )
}

export default MenuItem