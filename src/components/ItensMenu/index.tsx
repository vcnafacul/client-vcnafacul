import { Link } from "react-router-dom";
import { ItemMenu, SocialLink } from "../Header/types";

import { ReactComponent as FacebookIcon} from '../../assets/icons/facebook.svg'
import { ReactComponent as LinkedinIcon} from '../../assets/icons/linkedin.svg'
import { ReactComponent as TwitterIcon} from '../../assets/icons/twitter.svg'
import { ReactComponent as InstagramIcon} from '../../assets/icons/instagram.svg'

interface ItensMenuProps {
    itemsMenu: ItemMenu[]
    socialLinks: SocialLink;
    className: string;
}

function ItensMenu({ itemsMenu, socialLinks, className} : ItensMenuProps ) {
    return (
        <div className={className}>
            {itemsMenu.map(link => (
                <Link key={link.id} to={link.link}
                className=" text-marine text-xl font-bold
                    md:text-white md:text-base md:font-medium mb-12 md:mr-6"
                    >
                    {link.name}
                </Link>
            ))}
            <div className="text-green font-bold text-base md:hidden">
                Siga nossas redes sociais
            </div>
            <div className="w-12 h-0.5 bg-green my-4 mx-auto block md:hidden"/>
            <div className="flex md:hidden">
                <Link className="px-2" key={socialLinks.facebook} to={socialLinks.facebook || "#"}>
                    <FacebookIcon className="fill-marine"/>
                </Link>
                <Link className="px-2" key={socialLinks.linkedin} to={socialLinks.linkedin || "#"}>
                    <LinkedinIcon className="fill-marine"/>
                </Link>
                <Link className="px-2"  key={socialLinks.twitter} to={socialLinks.twitter || "#"}>
                    <TwitterIcon className="fill-marine"/>
                </Link>
                <Link className="px-2"  key={socialLinks.instagram} to={socialLinks.instagram || "#"}>
                    <InstagramIcon className="fill-marine"/>
                </Link>
            </div>
        </div>
    )
}

export default ItensMenu