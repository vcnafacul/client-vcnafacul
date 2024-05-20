/* eslint-disable @typescript-eslint/no-explicit-any */
import "react-loading-skeleton/dist/skeleton.css";
import { Navigation, Pagination } from "swiper/modules";
import { useHeroContext } from "../../../context/heroContext";
import Text from "../../atoms/text";
import BLink from "../../molecules/bLink";
import Carousel from "../../molecules/carousel";
import { HeroSkeleton } from "../heroSkeleton";

export interface LinkMenu {
  id: number;
  text: string;
  link: string;
  internal: boolean;
  target?: "_blank" | "_self";
}

export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  links: LinkMenu[];
  background_image?: string;
  image?: string;
  backgroud_color: string;
}

export interface HeroProps {
  className?: string;
}

function Hero({ className }: HeroProps) {
  const { heroSlides } = useHeroContext();

  if (heroSlides?.length === 0) return <HeroSkeleton />;
  return (
    <div className="relative">
      <Carousel
        modules={[Pagination, Navigation]}
        dynamicBullets
        spaceBetween={0}
        arrow
        arrowClassName="absolute bottom-5 px-8"
        fillArrow="fill-white"
        childrens={heroSlides.map((slide) => (
          <div
            key={slide.id}
            style={{ background: `${slide.backgroud_color}` }}
            className={`${className} min-h-[750px] sm:min-h-[480px] md:min-h-[600px] w-screen flex justify-center`}
          >
            <div
              className="container flex flex-col justify-start pt-24 min-h-screen box-border
                    sm:pt-20 sm:min-h-[430px] sm:flex-row sm:items-start sm:justify-between
                    md:min-h-[600px] md:self-center"
            >
              <div className="justify-start text-white sm:self-start md:w-full md:mb-28 md:self-center">
                <div className="md:transition duration-300 ease-out hover:translate-x-2.5 mx-10 md:mx-0">
                  <Text
                    size="primary"
                    className="mb-6 text-white md:text-left text-start"
                  >
                    {slide.title}
                  </Text>
                  <Text size="tertiary" className="text-white text-start">
                    {slide.subtitle}
                  </Text>
                </div>
                <div className="flex gap-4 px-2 min-w-80">
                  {slide.links.map((link: any) => (
                    <BLink
                      type="tertiary"
                      target={link.Home_Hero_Button_id.target}
                      hover
                      key={link.Home_Hero_Button_id.id}
                      to={link.Home_Hero_Button_id.link}
                    >
                      {link.Home_Hero_Button_id.text}
                    </BLink>
                  ))}
                </div>
              </div>
              <div className="relative w-full mx-auto my-0 max-w-80 sm:mt-1 sm:max-w-max sm:max-h-80 md:max-w-md md:m-0 md:top-0">
                {!slide.image ? null : (
                  <img src={slide.image} alt={slide.title} />
                )}
              </div>
            </div>
          </div>
        ))}
      />
    </div>
  );
}

export default Hero;
