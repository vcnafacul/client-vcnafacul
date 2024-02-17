import { useBaseTemplateContext } from "../../../context/baseTemplateContext";
import FollowUs from "../../molecules/followUs";
import Logo from "../../molecules/logo";
import MenuItem, { ItemMenuProps } from "../../molecules/menuItems";
import FooterSkeleton from "../footerSkeleton";

export interface FooterProps {
    sitemapLinks: ItemMenuProps[];
    pageLinks: ItemMenuProps[];
    slogan: string;
    email: string;
    socialLinks: ItemMenuProps[];
}

function Footer() {

    const { footer } = useBaseTemplateContext()

    if(!footer) return <FooterSkeleton />
    return (
        <footer className="bg-marine py-12 px-0 text-center text-base md:text-left md:pt-14 md:pb-9">
            <div className="container mx-auto flex flex-col md:grid md:grid-cols-4 md:gap-4">
                <div>
                    <Logo name text={footer.slogan}/>
                    <span>{footer.email}</span>
                </div>
                <MenuItem align="vertical" itemsMenu={footer.pageLinks} solid={false} />
                <MenuItem align="vertical" itemsMenu={footer.sitemapLinks} solid={false} />
                <FollowUs socialLinks={footer.socialLinks} solid={false} className="w-52 flex flex-col items-center"/>
            </div>
        </footer>
    );
}
export default Footer;
