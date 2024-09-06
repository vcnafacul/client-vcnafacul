import { useEffect } from "react";
import { toast } from "react-toastify";
import AboutUs from "../../components/organisms/aboutUs";
import ActionAreas from "../../components/organisms/actionAreas";
import Features from "../../components/organisms/features";
import HomeNews from "../../components/organisms/homeNews";
import Map from "../../components/organisms/map";
import Supporters from "../../components/organisms/supporters/index.tsx";
import HeroTemplate from "../../components/templates/heroTemplate";
import { HomeContext } from "../../context/homeContext.tsx";
import { getVolunteers } from "../../services/auth/getVolunteers.ts";
import { useHomeStore } from "../../store/home/index.ts";
import { DiffTime } from "../../utils/diffTime.ts";
import { about_us, actionAreas, features, supporters } from "./data.ts";

function Home() {
  const { volunteers, setVolunteers } = useHomeStore();

  useEffect(() => {
    if (volunteers.data.length === 0 || DiffTime(volunteers.updated, 8)) {
      getVolunteers()
        .then((res) => {
          setVolunteers(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HomeContext.Provider
      value={{
        aboutUs: about_us,
        features: features,
        actionAreas: actionAreas,
        supporters: supporters,
        volunteers: volunteers.data,
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
