import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AboutUs from "../../components/organisms/aboutUs";
import ActionAreas from "../../components/organisms/actionAreas";
import Features from "../../components/organisms/features";
import HomeNews from "../../components/organisms/homeNews";
import Map from "../../components/organisms/map";
import Supporters, {
  Volunteer,
} from "../../components/organisms/supporters/index.tsx";
import HeroTemplate from "../../components/templates/heroTemplate";
import { useBaseTemplateContext } from "../../context/baseTemplateContext";
import { HomeContext } from "../../context/homeContext.tsx";
import { HomeAbout } from "../../dtos/homeContent/homeAbout";
import { HomeFeature } from "../../dtos/homeContent/homeFeature";
import { HomeFeatureSection } from "../../dtos/homeContent/homeFeatureSection";
import { HomeSupporter } from "../../dtos/homeContent/homeSupporter";
import { getVolunteers } from "../../services/auth/getVolunteers.ts";
import { getHomeAbout } from "../../services/home/getHomeAbout";
import { getHomeFeatureSection } from "../../services/home/getHomeFeatureSection";
import { getHomeFeatures } from "../../services/home/getHomeFeatures";
import { getHomeSupporters } from "../../services/home/getHomeSupporters";
import { homeContentFile } from "../../services/urls";
import { about_us, actionAreas, supporters } from "./data.ts";

function Home() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [aboutFromApi, setAboutFromApi] = useState<HomeAbout | null>(null);
  const [sectionFromApi, setSectionFromApi] =
    useState<HomeFeatureSection | null>(null);
  const [featuresFromApi, setFeaturesFromApi] = useState<HomeFeature[]>([]);
  const [supportersFromApi, setSupportersFromApi] = useState<HomeSupporter[]>(
    []
  );
  const { hasNews } = useBaseTemplateContext();

  useEffect(() => {
    getVolunteers()
      .then((res) => {
        setVolunteers(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });

  }, []);

  useEffect(() => {
    getHomeAbout()
      .then((res) => {
        setAboutFromApi(res);
      })
      .catch(() => {});

    getHomeFeatureSection()
      .then((res) => {
        setSectionFromApi(res);
      })
      .catch(() => {});

    getHomeFeatures()
      .then((res) => {
        setFeaturesFromApi(res);
      })
      .catch(() => {});

    getHomeSupporters()
      .then((res) => {
        setSupportersFromApi(res);
      })
      .catch(() => {});
  }, []);

  const aboutValue = aboutFromApi
    ? {
        title: about_us.title,
        description: aboutFromApi.description ?? about_us.description,
        thumbnail: aboutFromApi.thumbnailUrl
          ? homeContentFile(aboutFromApi.thumbnailUrl)
          : about_us.thumbnail,
        videoID: aboutFromApi.videoUrl ?? about_us.videoID,
      }
    : about_us;

  const featuresValue = {
    title: sectionFromApi?.title ?? "",
    description: sectionFromApi?.description ?? null,
    items: featuresFromApi.map((f) => ({
      Home_Features_Item_id: {
        id: f.id,
        title: f.title,
        description: f.description,
        image: f.imageUrl ? homeContentFile(f.imageUrl) : "",
      },
    })),
  };

  const supportersValue = {
    title: supporters.title,
    subtitle: supporters.subtitle,
    sponsors:
      supportersFromApi.length > 0
        ? supportersFromApi.map((s) => ({
            Patrocinador_id: {
              image: s.logoUrl ? homeContentFile(s.logoUrl) : "",
              alt: s.name,
              link: s.link,
            },
          }))
        : supporters.sponsors,
  };

  return (
    <HomeContext.Provider
      value={{
        aboutUs: aboutValue,
        features: featuresValue,
        actionAreas: actionAreas,
        supporters: supportersValue,
        volunteers: volunteers,
        prepCourse: supporters.prepCourse,
      }}
    >
      <HeroTemplate headerPosition="fixed">
        <>
          <AboutUs />
          {hasNews !== false && <HomeNews />}
          <Features />
          <ActionAreas />
          <Supporters />
          <Map />
        </>
      </HeroTemplate>
    </HomeContext.Provider>
  );
}

export default Home;
