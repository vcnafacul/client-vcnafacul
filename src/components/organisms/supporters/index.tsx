import { useState } from "react";
import { Navigation, Pagination } from 'swiper/modules';
import { useHomeContext } from "../../../context/homeContext";
import Text from "../../atoms/text";
import Carousel from "../../molecules/carousel";
import Selector from "../../molecules/selector";
import './styles.css';
import SupportersSkeleton from "../supportersSkeleton";

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

interface SponsorProps {
    Patrocinador_id: Sponsor
}

export interface SupportersSponsor {
    title: string;
    subtitle: string;
    sponsors: SponsorProps[];
}

export interface SupportersProps extends SupportersSponsor {
    volunteers: Volunteer[];
}

function Supporters() {

    const { supporters, volunteers } = useHomeContext()

    const tabItems = ['Empresas', 'Voluntários']
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
        <div key={index} className="flex flex-col items-center">
            <div className="w-40 h-40">
                <img className="rounded-full" src={volunteer.image as string} alt={volunteer.alt}/>
            </div>
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
            modules={[Pagination, Navigation]}
        />
    };

    if(!supporters || !volunteers) return <SupportersSkeleton />
    return  <div className=" bg-white relative">
        <div className="relative h-10 bg-white" id="supporters" />
        <div className="py-12 px-0 md:py-14 ">
            <div className="mb-8">
                <Text size="secondary">{supporters!.title}</Text>
                <Text size="tertiary">{supporters!.subtitle}</Text>
            </div>
            {volunteers.length > 0 ? <Selector tabItems={tabItems} changeItem={changeTab}/> : <></>}
            {tab === 0  ?
                <div className="flex justify-around items-center flex-wrap">
                    {supporters!.sponsors.map((sponsor, index) => (
                        <a key={index} href={sponsor.Patrocinador_id.link} target="_blank">
                            <img className="sponsors_image" src={sponsor.Patrocinador_id.image as string} alt={sponsor.Patrocinador_id.alt}/>
                        </a>
                    ))}
                </div>
            : <div className="flex justify-around items-center flex-wrap w-full">
                    <Volunteers />
                </div>
            }

            </div>
        </div> 
    
}

export default Supporters