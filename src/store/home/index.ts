import { DateTime } from "luxon";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AboutUsProps } from "../../components/organisms/aboutUs";
import { ActionProps } from "../../components/organisms/actionAreas";
import { FeaturesProps } from "../../components/organisms/features";
import { FooterProps } from "../../components/organisms/footer";
import { Slide } from "../../components/organisms/hero";
import {
  SupportersSponsor,
  Volunteer,
} from "../../components/organisms/supporters";
import { News } from "../../dtos/news/news";
import { Geolocation } from "../../types/geolocation/geolocation";

export type HomeState = {
  hero: {
    data: Slide[];
    updatedHero: DateTime;
  };
  footer: {
    data: FooterProps | null;
    updatedHero: DateTime;
  };
  aboutUs: {
    data: AboutUsProps | null;
    updatedHero: DateTime;
  };
  features: {
    data: FeaturesProps | null;
    updatedHero: DateTime;
  };
  actionAreas: {
    data: ActionProps | null;
    updatedHero: DateTime;
  };
  supporters: {
    data: SupportersSponsor | null;
    updatedHero: DateTime;
  };
  volunteers: {
    data: Volunteer[];
    updatedHero: DateTime;
  };
  markers: {
    data: Geolocation[];
    updatedHero: DateTime;
  };
  news: {
    data: News[];
    updatedHero: DateTime;
  };
  setHero: (hero: Slide[]) => void;
  setFooter: (footer: FooterProps) => void;
  setAboutUs: (aboutUs: AboutUsProps) => void;
  setFeatures: (features: FeaturesProps) => void;
  setActionAreas: (actionAreas: ActionProps) => void;
  setSupporters: (supporters: SupportersSponsor) => void;
  setVolunteers: (volunteers: Volunteer[]) => void;
  setMarkers: (markers: Geolocation[]) => void;
  setNews: (news: News[]) => void;
};

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      hero: {
        data: [],
        updatedHero: DateTime.now(),
      },
      footer: {
        data: null,
        updatedHero: DateTime.now(),
      },
      aboutUs: {
        data: null,
        updatedHero: DateTime.now(),
      },
      features: {
        data: null,
        updatedHero: DateTime.now(),
      },
      actionAreas: {
        data: null,
        updatedHero: DateTime.now(),
      },
      supporters: {
        data: null,
        updatedHero: DateTime.now(),
      },
      volunteers: {
        data: [],
        updatedHero: DateTime.now(),
      },
      markers: {
        data: [],
        updatedHero: DateTime.now(),
      },
      news: {
        data: [],
        updatedHero: DateTime.now(),
      },
      setHero: (hero) =>
        set({ hero: { data: hero, updatedHero: DateTime.now() } }),
      setFooter: (footer) =>
        set({ footer: { data: footer, updatedHero: DateTime.now() } }),
      setAboutUs: (aboutUs) =>
        set({ aboutUs: { data: aboutUs, updatedHero: DateTime.now() } }),
      setFeatures: (features) =>
        set({ features: { data: features, updatedHero: DateTime.now() } }),
      setActionAreas: (actionAreas) =>
        set({
          actionAreas: { data: actionAreas, updatedHero: DateTime.now() },
        }),
      setSupporters: (supporters) =>
        set({ supporters: { data: supporters, updatedHero: DateTime.now() } }),
      setVolunteers: (volunteers) =>
        set({ volunteers: { data: volunteers, updatedHero: DateTime.now() } }),
      setMarkers: (markers) =>
        set({ markers: { data: markers, updatedHero: DateTime.now() } }),
      setNews: (news) =>
        set({ news: { data: news, updatedHero: DateTime.now() } }),
    }),
    {
      name: "cms",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
