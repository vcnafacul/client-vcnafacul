import { ItemMenu, SocialLink } from "../../../types/baseTemplate";
import Logo from "../../molecules/logo";
import FollowUs from "../../molecules/followUs";
import MenuItem from "../../molecules/menuItems";

export interface FooterProps {
    sitemapLinks: ItemMenu[];
    pageLinks: ItemMenu[];
    slogan: string;
    email: string;
    socialLinks: SocialLink
}

function Footer({sitemapLinks, pageLinks, slogan, email, socialLinks} : FooterProps) {
    return (
        <section className="bg-marine py-12 px-0 text-center text-base text-white md:text-left md:pt-14 md:pb-9">
            <div className="container mx-auto flex flex-col md:grid md:grid-cols-4 md:gap-4">
                <Logo name text="Equidade. Oportunidade. Realização."/>
                <MenuItem align="vertical" itemsMenu={pageLinks} />
                <MenuItem align="vertical" itemsMenu={sitemapLinks} />
                <FollowUs socialLinks={socialLinks}/>
            </div>
        </section>
    );
}
export default Footer;
