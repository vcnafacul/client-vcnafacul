import Logo from "../../molecules/logo";
import FollowUs, { SocialLink } from "../../molecules/followUs";
import MenuItem, { ItemMenu } from "../../molecules/menuItems";

export interface FooterProps {
    sitemapLinks: ItemMenu[];
    pageLinks: ItemMenu[];
    slogan: string;
    email: string;
    socialLinks: SocialLink
}

function Footer({sitemapLinks, pageLinks, socialLinks} : FooterProps) {
    return (
        <section className="bg-marine py-12 px-0 text-center text-base md:text-left md:pt-14 md:pb-9">
        <div className="container mx-auto flex flex-col md:grid md:grid-cols-4 md:gap-4">
            <Logo name text="Equidade. Oportunidade. Realização."/>
            <MenuItem align="vertical" itemsMenu={pageLinks} solid={false} />
            <MenuItem align="vertical" itemsMenu={sitemapLinks} solid={false} />
            <FollowUs socialLinks={socialLinks} solid={false} className="w-52 flex flex-col items-center"/>
        </div>
        </section>
    );
}
export default Footer;
