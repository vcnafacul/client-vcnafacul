import { useEffect, useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { useHomeContext } from "../../../context/homeContext";
import { getPhotoCollaborator } from "../../../services/prepCourse/collaborator/get-photo";
import Text from "../../atoms/text";
import Carousel from "../../molecules/carousel";
import Selector from "../../molecules/selector";
import SupportersSkeleton from "../supportersSkeleton";

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
  const [volunteerPhotos, setVolunteerPhotos] = useState<
    Record<string, string>
  >({});
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
              src={
                volunteerPhotos[volunteer.image] ||
                `${VITE_FTP_PROFILE}/${volunteer.image}`
              }
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
    if (volunteers.length === 0) {
      return <SupportersSkeleton />;
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
          className="flex justify-center items-center h-80"
        >
          <div className="flex flex-col items-center py-6 justify-center select-none w-full h-full">
            <img
              src={sponsor.Patrocinador_id.image as string}
              alt={sponsor.Patrocinador_id.alt}
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "100%",
                objectFit: "contain",
              }}
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
        spaceBetween={60}
        modules={[Pagination, Navigation]}
      />
    );
  };

  useEffect(() => {
    if (volunteers.length === 0) {
      setTab(TabItems.Empresas);
    } else {
      setTab(TabItems.Voluntarios);
    }
  }, [volunteers]);

  useEffect(() => {
    const loadPhotos = async () => {
      const photoUrls: Record<string, string> = {};

      for (const volunteer of volunteers) {
        if (volunteer.image) {
          try {
            const blob = await getPhotoCollaborator(volunteer.image);
            const url = URL.createObjectURL(blob);
            photoUrls[volunteer.image] = url;
          } catch (error) {
            console.error(
              `Erro ao carregar foto do colaborador ${volunteer.name}:`,
              error
            );
            // Fallback para a URL do FTP caso falhe
            photoUrls[
              volunteer.image
            ] = `${VITE_FTP_PROFILE}/${volunteer.image}`;
          }
        }
      }

      setVolunteerPhotos(photoUrls);
    };

    if (volunteers.length > 0) {
      loadPhotos();
    }

    // Cleanup das URLs criadas
    return () => {
      Object.values(volunteerPhotos).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [volunteers, VITE_FTP_PROFILE]);

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
          <div className="flex justify-around items-center">
            <Empresas />
          </div>
        ) : tab == TabItems.Voluntarios ? (
          <div className="flex justify-around items-center w-full h-80">
            <Volunteers />
          </div>
        ) : (
          prepCourse.length > 0 && (
            <div className="flex justify-around items-center h-80 w-full">
              {prepCourse.map((sponsor, index) => (
                <a key={index} href={sponsor.link} target="_blank">
                  <img
                    className="h-80 my-1 mx-0"
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
