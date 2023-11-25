import { VariantProps, tv } from "tailwind-variants"
import { ItemMenu } from "../../../types/baseTemplate";
import { Link } from "react-router-dom";

const menuItem = tv({
    base: 'flex',
    variants: {
        align: {
            horizontal: 'flex-row',
            vertical: 'flex-col'
        },
    },
    defaultVariants: {
        align: 'horizontal'
    }
})

type MenuItemProps = VariantProps<typeof menuItem> & {
    className?: string;
    itemsMenu: ItemMenu[],
    solid: boolean;
}

function MenuItem({ align, itemsMenu, className, solid } : MenuItemProps) {
    return (
        <div className={menuItem({ align, className })}>
            {itemsMenu.map(link => (
                <Link 
                    className={`text-xl font-bold md:text-base md:font-medium
                    ${align === 'vertical' ? 'mb-2' : 'md:ml-10 md:mr-6'}
                    ${solid ? 'text-marine' : 'text-white'}}`}
                key={link.id} to={link.link}>{link.name}</Link>
            ))}
        </div>
    )
}

export default MenuItem