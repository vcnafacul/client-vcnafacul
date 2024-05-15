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
    updatedHero: Date;
  };
  footer: {
    data: FooterProps | null;
    updatedHero: Date;
  };
  aboutUs: {
    data: AboutUsProps | null;
    updatedHero: Date;
  };
  features: {
    data: FeaturesProps | null;
    updatedHero: Date;
  };
  actionAreas: {
    data: ActionProps | null;
    updatedHero: Date;
  };
  supporters: {
    data: SupportersSponsor | null;
    updatedHero: Date;
  };
  volunteers: {
    data: Volunteer[];
    updatedHero: Date;
  };
  markers: {
    data: Geolocation[];
    updatedHero: Date;
  };
  news: {
    data: News[];
    updatedHero: Date;
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
        updatedHero: new Date(),
      },
      footer: {
        data: null,
        updatedHero: new Date(),
      },
      aboutUs: {
        data: null,
        updatedHero: new Date(),
      },
      features: {
        data: null,
        updatedHero: new Date(),
      },
      actionAreas: {
        data: null,
        updatedHero: new Date(),
      },
      supporters: {
        data: null,
        updatedHero: new Date(),
      },
      volunteers: {
        data: [],
        updatedHero: new Date(),
      },
      markers: {
        data: [],
        updatedHero: new Date(),
      },
      news: {
        data: [],
        updatedHero: new Date(),
      },
      setHero: (hero) => set({ hero: { data: hero, updatedHero: new Date() } }),
      setFooter: (footer) =>
        set({ footer: { data: footer, updatedHero: new Date() } }),
      setAboutUs: (aboutUs) =>
        set({ aboutUs: { data: aboutUs, updatedHero: new Date() } }),
      setFeatures: (features) =>
        set({ features: { data: features, updatedHero: new Date() } }),
      setActionAreas: (actionAreas) =>
        set({ actionAreas: { data: actionAreas, updatedHero: new Date() } }),
      setSupporters: (supporters) =>
        set({ supporters: { data: supporters, updatedHero: new Date() } }),
      setVolunteers: (volunteers) =>
        set({ volunteers: { data: volunteers, updatedHero: new Date() } }),
      setMarkers: (markers) =>
        set({ markers: { data: markers, updatedHero: new Date() } }),
      setNews: (news) => set({ news: { data: news, updatedHero: new Date() } }),
    }),
    {
      name: "cms",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
