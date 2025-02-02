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
import { HomeContext } from "../../context/homeContext.tsx";
import { getVolunteers } from "../../services/auth/getVolunteers.ts";
import { about_us, actionAreas, features, supporters } from "./data.ts";

function Home() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    getVolunteers()
      .then((res) => {
        setVolunteers(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HomeContext.Provider
      value={{
        aboutUs: about_us,
        features: features,
        actionAreas: actionAreas,
        supporters: supporters,
        volunteers: volunteers,
        prepCourse: supporters.prepCourse,
      }}
    >
      <HeroTemplate headerPosition="fixed">
        <>
          <AboutUs />
          <HomeNews />
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
