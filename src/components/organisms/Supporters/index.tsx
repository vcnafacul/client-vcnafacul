import Text from "../../atoms/text"
import Selector from "../../molecules/selector"
import './styles.css'

interface Sponsor {
    image: React.FC<React.SVGProps<SVGSVGElement>> | string;
    alt: string;
    link: string;
}

interface Volunteer {
    image:  string;
    name: string;
    alt:  string;
}

export interface SupportersProps {
    title: string;
    subtitle: string;
    tabItems: string[];
    sponsors: Sponsor[];
    volunteers: Volunteer[];
}

function Supporters({title, subtitle, tabItems, sponsors, volunteers} : SupportersProps) {
    return (
        <div id="supporters" className="supporters container mx-auto py-12 px-0 block overflow-x-hidden md:py-14">
            <div className="mb-8">
                <Text size="secondary">{title}</Text>
                <Text size="tertiary">{subtitle}</Text>
            </div>
            <Selector tabItems={tabItems} changeItem={() => {}}/>
            <div className="flex justify-around items-center flex-wrap">
                {sponsors.map((sponsor) => (
                    <a href={sponsor.link} target="_blank">
                        <img className="sponsors_image" src={sponsor.image as string} alt={sponsor.alt}/>
                    </a>
                ))}
            </div>
            <div className="flex justify-around items-center flex-wrap">
                {volunteers.map((volunteer) => (
                   <>
                        <img className="sponsors_image" src={volunteer.image as string} alt={volunteer.alt}/>
                        <p>{volunteer.name}</p>
                    </>
                ))}
            </div>
        </div>
    )
}

export default Supporters