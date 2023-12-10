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
        <div id="supporters" className="w-full bg-white">
            <div className="container mx-auto py-12 px-0 md:py-14 ">
                <div className="mb-8">
                    <Text size="secondary">{title}</Text>
                    <Text size="tertiary">{subtitle}</Text>
                </div>
                <Selector tabItems={tabItems} changeItem={() => {}}/>
                <div className="flex justify-around items-center flex-wrap">
                    {sponsors.map((sponsor, index) => (
                        <a key={index} href={sponsor.link} target="_blank">
                            <img className="sponsors_image" src={sponsor.image as string} alt={sponsor.alt}/>
                        </a>
                    ))}
                </div>
                <div className="flex justify-around items-center flex-wrap">
                    {volunteers.map((volunteer, index) => (
                    <div key={index}>
                            <img className="sponsors_image" src={volunteer.image as string} alt={volunteer.alt}/>
                            <p>{volunteer.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Supporters