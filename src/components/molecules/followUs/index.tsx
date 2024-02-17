import { Link } from "react-router-dom";
import { ItemMenuProps } from "../menuItems";

interface FollowUsProps {
    socialLinks: ItemMenuProps[];
    solid: boolean;
    className?: string;
}

function FollowUs({ socialLinks, className } : FollowUsProps) {
    return (
        <div className={className}>
            <div className="text-green font-bold text-base">
                Siga nossas redes sociais
            </div>
            <div className="flex w-full justify-around py-8">
                {socialLinks.map(social => (
                    <Link key={social.Home_Menu_Item_id.id} to={social.Home_Menu_Item_id.link || "#"}>
                        {social.Home_Menu_Item_id.image_dark_theme ? 
                            <img src={social.Home_Menu_Item_id.image_dark_theme!} /> : 
                            <img src={social.Home_Menu_Item_id.image!} />}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default FollowUs