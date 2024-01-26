import { Link } from "react-router-dom"
import { ReactComponent as FacebookIcon} from "../../../assets/icons/facebook.svg"
import { ReactComponent as LinkedinIcon} from "../../../assets/icons/linkedin.svg"
import { ReactComponent as TwitterIcon} from "../../../assets/icons/twitter.svg"
import { ReactComponent as InstagramIcon} from "../../../assets/icons/instagram.svg"

export interface SocialLink {
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
}

interface FollowUsProps {
    socialLinks: SocialLink;
    solid: boolean;
    className?: string;
}

function FollowUs({ socialLinks, solid, className } : FollowUsProps) {
    return (
        <div className={className}>
            <div className="text-green font-bold text-base">
                Siga nossas redes sociais
            </div>
            <div className="flex w-full justify-around py-8">
                <Link key={'socialLinks.facebook'} to={socialLinks.facebook || "#"}>
                    <FacebookIcon className={`${solid ? 'fill-marine': 'fill-white'}`}/>
                </Link>
               <Link key={'socialLinks.linkedin'} to={socialLinks.linkedin || "#"}>
                    <LinkedinIcon className={`${solid ? 'fill-marine': 'fill-white'}`}/>
                </Link>
               <Link key={'socialLinks.twitter'} to={socialLinks.twitter || "#"}>
                    <TwitterIcon className={`${solid ? 'fill-marine': 'fill-white'}`}/>
                </Link>
                <Link key={'socialLinks.instagram'} to={socialLinks.instagram || "#"}>
                    <InstagramIcon className={`${solid ? 'fill-marine': 'fill-white'}`}/>
                </Link>
            </div>
        </div>
    )
}

export default FollowUs