import { Link } from "react-router-dom";
import { useBaseTemplateContext } from "../../../context/baseTemplateContext";
import { ItemMenuProps } from "../menuItems";

interface FollowUsProps {
    solid?: boolean;
    className?: string;
}

export interface SocialLink extends ItemMenuProps {
    image: React.FC<React.SVGProps<SVGSVGElement>> | string;
}

function FollowUs({ className, solid = false } : FollowUsProps) {
    const { header } = useBaseTemplateContext()
    return (
        <div className={className}>
            <div className="text-green font-bold text-base">
                Siga nossas redes sociais
            </div>
            <div className="flex w-full justify-around py-8">
                {header.socialLinks.map(social => {
                    const Icon = social.image;
                    return (
                        <Link key={social.Home_Menu_Item_id.id} to={social.Home_Menu_Item_id.link || "#"}>
                            <Icon className={`${solid ? 'fill-marine': 'fill-white'}`}/>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default FollowUs