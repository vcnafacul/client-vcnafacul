import { useBaseTemplateContext } from "../../../context/baseTemplateContext";
import FollowUs, { SocialLink } from "../../molecules/followUs";
import Logo from "../../molecules/logo";
import MenuItem, { ItemMenuProps } from "../../molecules/menuItems";
import FooterSkeleton from "../footerSkeleton";

export interface FooterProps {
  sitemapLinks: ItemMenuProps[];
  pageLinks: ItemMenuProps[];
  slogan: string;
  contact: string;
  socialLinks: SocialLink[];
}

function Footer() {
  const { footer, hasFooter } = useBaseTemplateContext();

  if (!hasFooter) return <></>;
  if (!footer) return <FooterSkeleton />;
  return (
    <footer className="px-0 py-12 text-base text-center bg-marine md:text-left md:pt-14 md:pb-9">
      <div className="container flex flex-col mx-auto md:grid md:grid-cols-4 md:gap-4">
        <div>
          <Logo name text={footer.slogan} />
          <div className="mt-4 font-black text-white">{footer.contact}</div>
        </div>
        <MenuItem align="vertical" itemsMenu={footer.pageLinks} solid={false} />
        <MenuItem
          align="vertical"
          itemsMenu={footer.sitemapLinks}
          solid={false}
        />
        <FollowUs className="flex flex-col items-center w-52" />
      </div>
    </footer>
  );
}
export default Footer;
