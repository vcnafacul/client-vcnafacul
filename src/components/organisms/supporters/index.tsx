import { useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { useHomeContext } from "../../../context/homeContext";
import Text from "../../atoms/text";
import Carousel from "../../molecules/carousel";
import Selector from "../../molecules/selector";
import SupportersSkeleton from "../supportersSkeleton";
import "./styles.css";

export interface Sponsor {
  image: React.FC<React.SVGProps<SVGSVGElement>> | string;
  alt: string;
  link: string;
}

export interface Volunteer {
  image: string;
  name: string;
  description: string;
  alt: string;
  actived: boolean;
}

interface SponsorProps {
  Patrocinador_id: Sponsor;
}

export interface SupportersSponsor {
  title: string;
  subtitle: string;
  sponsors: SponsorProps[];
}

export interface SupportersProps extends SupportersSponsor {
  volunteers: Volunteer[];
  prepCourse: Sponsor[];
}

enum TabItems {
  Empresas,
  Voluntarios,
  Cursinho_Parceiro,
}

function Supporters() {
  const { supporters, volunteers, prepCourse } = useHomeContext();

  const tabItems = ["Empresas", "Voluntários", "Cursinho Parceiro"];
  const [tab, setTab] = useState<TabItems>(
    volunteers.length === 0 ? TabItems.Empresas : TabItems.Voluntarios
  );
  const changeTab = (tab: number) => {
    setTab(tab);
  };
  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

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
  };

  const CardVolunteers = (volunteers: Volunteer[]) =>
    volunteers
      .filter((volunteer) => volunteer.image)
      .map((volunteer, index) => (
        <div
          key={index}
          className="flex flex-col items-center mb-8 select-none"
        >
          <div className="w-40 h-40 mb-2">
            <img
              className={`rounded-full object-cover ${
                volunteer.actived ? "" : "grayscale"
              }`}
              src={`${VITE_FTP_PROFILE}/${volunteer.image}`}
              alt={volunteer.alt}
            />
          </div>
          <p className="font-base text-marine text-lg">{volunteer.name}</p>
          <p className="font-thin text-marine text-base">
            {volunteer.description?.substring(0, 30) +
              `${volunteer.description?.length > 30 ? " ..." : ""}`}
          </p>
          <p className="font-thin text-marine text-base">
            {`${volunteer.actived ? "" : "Ex-membro"}`}
          </p>
        </div>
      ));

  const Volunteers = () => {
    if(volunteers.length === 0) {
      return <SupportersSkeleton />
    }
    const childrens = CardVolunteers(volunteers);
    return (
      <Carousel
        childrens={childrens}
        className="bg-white w-full"
        pagination
        dynamicBullets
        breakpoints={breakpoints}
        modules={[Pagination, Navigation]}
      />
    );
  };

  const CardSupporters = (supporters: SponsorProps[]) =>
    supporters
      .filter((sponsor) => sponsor.Patrocinador_id.image)
      .map((sponsor, index) => (
        <a
          key={index}
          href={sponsor.Patrocinador_id.link}
          target="_blank"
          className="flex justify-center items-center h-96"
        >
          <div className="flex flex-col items-center justify-center mb-8 select-none w-full">
            <img
              className="max-w-full max-h-full object-contain sponsors_image"
              src={sponsor.Patrocinador_id.image as string}
              alt={sponsor.Patrocinador_id.alt}
            />
          </div>
        </a>
      ));

  const Empresas = () => {
    const childrens = CardSupporters(supporters?.sponsors || []);
    return (
      <Carousel
        childrens={childrens}
        className="bg-white w-[95vw] h-full flex justify-center items-center"
        pagination
        dynamicBullets
        breakpoints={{
          1: {
            slidesPerView: 1,
          },
          600: {
            slidesPerView: 2,
          },
          1000: {
            slidesPerView: 3,
          },
          1500: {
            slidesPerView: 3,
          },
          1600: {
            slidesPerView: 3.1,
          },
        }}
        spaceBetween={120}
        modules={[Pagination, Navigation]}
      />
    );
  };

  if (!supporters || !volunteers) return <SupportersSkeleton />;
  return (
    <div className=" bg-white relative px-2">
      <div className="relative h-10 bg-white" id="supporters" />
      <div className="py-12 px-0 md:py-14">
        <div className="mb-8">
          <Text size="secondary">{supporters!.title}</Text>
          <Text size="tertiary">{supporters!.subtitle}</Text>
        </div>
        <Selector tabItems={tabItems} changeItem={changeTab} activeTab={tab} />
        {tab === TabItems.Empresas ? (
          <div className="flex justify-around items-center flex-wrap h-96">
            <Empresas />
          </div>
        ) : tab == TabItems.Voluntarios ? (
          <div className="flex justify-around items-center flex-wrap w-full h-96">
            <Volunteers />
          </div>
        ) : (
          prepCourse.length > 0 && (
            <div className="flex justify-around items-center flex-wrap h-96">
              {prepCourse.map((sponsor, index) => (
                <a key={index} href={sponsor.link} target="_blank">
                  <img
                    className="h-96 my-1 mx-0"
                    src={sponsor.image as string}
                    alt="Cursinho Parceiro"
                  />
                </a>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Supporters;
