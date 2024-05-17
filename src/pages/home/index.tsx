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
import { getAboutUs } from "../../services/directus/home/about_us.ts";
import { getActions } from "../../services/directus/home/actions.ts";
import { getFeature } from "../../services/directus/home/features.ts";
import { getSponsor } from "../../services/directus/home/sponsors.ts";
import { useHomeStore } from "../../store/home/index.ts";
import { DiffTime } from "../../utils/diffTime.ts";

function Home() {
  const {
    aboutUs,
    setAboutUs,
    features,
    setFeatures,
    actionAreas,
    setActionAreas,
    supporters,
    setSupporters,
    volunteers,
    setVolunteers,
  } = useHomeStore();

  useEffect(() => {
    if (!aboutUs.data || DiffTime(aboutUs.updatedHero, 8)) {
      getAboutUs()
        .then((res) => {
          setAboutUs(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [aboutUs, setAboutUs]);

  useEffect(() => {
    if (!features.data || DiffTime(features.updatedHero, 8)) {
      getFeature()
        .then((res) => {
          setFeatures(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [features.data, setFeatures]);

  useEffect(() => {
    if (!actionAreas.data || DiffTime(actionAreas.updatedHero, 8)) {
      getActions()
        .then((res) => {
          setActionAreas(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [actionAreas, setActionAreas]);

  useEffect(() => {
    if (!supporters.data || DiffTime(supporters.updatedHero, 8)) {
      getSponsor()
        .then((res) => {
          setSupporters(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [supporters, setSupporters]);

  useEffect(() => {
    if (volunteers.data.length === 0 || DiffTime(volunteers.updatedHero, 8)) {
      getVolunteers()
        .then((res) => {
          setVolunteers(res);
        })
        .catch((error: Error) => {
          toast.error(error.message);
        });
    }
  }, [volunteers, setVolunteers]);

  return (
    <HomeContext.Provider
      value={{
        aboutUs: aboutUs.data,
        features: features.data,
        actionAreas: actionAreas.data,
        supporters: supporters.data,
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
