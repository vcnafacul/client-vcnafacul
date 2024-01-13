import { useState } from "react";
import Text from "../../atoms/text"
import Selector from "../../molecules/selector"
import './styles.css'
import Carousel from "../../molecules/carousel";

interface Sponsor {
    image: React.FC<React.SVGProps<SVGSVGElement>> | string;
    alt: string;
    link: string;
}

export interface Volunteer {
    image:  string;
    name: string;
    description: string;
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
    const [tab, setTab] = useState<number>(0)
    const changeTab = (tab: number) => {
        setTab(tab)
    }

    const breakpoints = {
        1: {
            slidesPerView: 1.5,
        },
        500: {
            slidesPerView: 2,
        },
        800: {
            slidesPerView: 2.5,
        },
        1000: {
            slidesPerView: 3,
        },
        1200: {
            slidesPerView: 4.5,
        },
      }

    const CardVolunteers = (volunteers: Volunteer[]) => volunteers.map((volunteer, index) => (
        <div key={index} className="flex flex-col items-center w-48 mt-10">
            <img className="w-40 h-40 rounded-full" src={volunteer.image as string} alt={volunteer.alt}/>
            <p className="font-base text-marine text-lg">{volunteer.name}</p>
            <p className="font-thin text-marine text-base">{volunteer.description.substring(0, 30) + `${volunteer.description.length > 30 ? ' ...' : ''}`}</p>
        </div>
        ))

    const Volunteers = () => {
        const childrens = CardVolunteers(volunteers)
        return <Carousel
            childrens={childrens}
            className="bg-white w-full"
            pagination
            dynamicBullets
            breakpoints={breakpoints}
        />
    };

    return (
        <div id="supporters" className=" bg-white relative">
            <div className="py-12 px-0 md:py-14 ">
                <div className="mb-8">
                    <Text size="secondary">{title}</Text>
                    <Text size="tertiary">{subtitle}</Text>
                </div>
                {volunteers.length > 0 ? <Selector tabItems={tabItems} changeItem={changeTab}/> : <></>}
                {tab === 0  ?
                    <div className="flex justify-around items-center flex-wrap">
                        {sponsors.map((sponsor, index) => (
                            <a key={index} href={sponsor.link} target="_blank">
                                <img className="sponsors_image" src={sponsor.image as string} alt={sponsor.alt}/>
                            </a>
                        ))}
                    </div>
                : <div className="flex justify-around items-center flex-wrap w-full">
                        <Volunteers />
                    </div>
                }
                
                
            </div>
        </div>
    )
}

export default Supporters