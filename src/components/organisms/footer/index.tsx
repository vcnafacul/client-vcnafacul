import { Link } from "react-router-dom";
import Logo from "../../atoms/logo";
import { ReactComponent as FacebookIcon} from "../../../assets/icons/facebook.svg"
import { ReactComponent as LinkedinIcon} from "../../../assets/icons/linkedin.svg"
import { ReactComponent as TwitterIcon} from "../../../assets/icons/twitter.svg"
import { ReactComponent as InstagramIcon} from "../../../assets/icons/instagram.svg"

function Footer() {
    return (
        <section className="bg-marine py-12 px-0 text-center text-base text-white md:text-left md:pt-14 md:pb-9">
            <div className="container mx-auto flex flex-col md:grid md:grid-cols-4 md:gap-4">
                <Logo name text="Equidade. Oportunidade. Realização."/>
                <div className="flex flex-col mb-14 md:ml-10">
                    <p>Quem somos</p>
                </div>
                <div className="flex flex-col mb-14 md:ml-10">
                    <p>Termo de serviço</p>
                </div>
                <div>
                    <div className="text-green font-bold text-base">
                        Siga nossas redes sociais
                    </div>
                    <div className="w-12 h-0.5 bg-green my-4 mx-auto block"/>
                    <div className="flex">
                        <Link className="px-2" key={'socialLinks.facebook'} to={'socialLinks.facebook' || "#"}>
                            <FacebookIcon className="fill-white"/>
                        </Link>
                        <Link className="px-2" key={'socialLinks.linkedin'} to={'socialLinks.linkedin' || "#"}>
                            <LinkedinIcon className="fill-white"/>
                        </Link>
                        <Link className="px-2"  key={'socialLinks.twitter'} to={'socialLinks.twitter' || "#"}>
                            <TwitterIcon className="fill-white"/>
                        </Link>
                        <Link className="px-2"  key={'socialLinks.instagram'} to={'socialLinks.instagram '|| "#"}>
                            <InstagramIcon className="fill-white"/>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Footer;
