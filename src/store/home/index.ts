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
import { Marker } from "../../types/map/marker";

export type HomeState = {
  hero: {
    data: Slide[];
    updated: number;
  };
  footer: {
    data: FooterProps | null;
    updated: number;
  };
  aboutUs: {
    data: AboutUsProps | null;
    updated: number;
  };
  features: {
    data: FeaturesProps | null;
    updated: number;
  };
  actionAreas: {
    data: ActionProps | null;
    updated: number;
  };
  supporters: {
    data: SupportersSponsor | null;
    updated: number;
  };
  volunteers: {
    data: Volunteer[];
    updated: number;
  };
  markers: {
    data: Marker[];
    updated: number;
  };
  news: {
    data: News[];
    updated: number;
  };
  setHero: (hero: Slide[]) => void;
  setFooter: (footer: FooterProps) => void;
  setAboutUs: (aboutUs: AboutUsProps) => void;
  setFeatures: (features: FeaturesProps) => void;
  setActionAreas: (actionAreas: ActionProps) => void;
  setSupporters: (supporters: SupportersSponsor) => void;
  setVolunteers: (volunteers: Volunteer[]) => void;
  setMarkers: (markers: Marker[]) => void;
  setNews: (news: News[]) => void;
};

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      hero: {
        data: [],
        updated: new Date().getTime(),
      },
      footer: {
        data: null,
        updated: new Date().getTime(),
      },
      aboutUs: {
        data: null,
        updated: new Date().getTime(),
      },
      features: {
        data: null,
        updated: new Date().getTime(),
      },
      actionAreas: {
        data: null,
        updated: new Date().getTime(),
      },
      supporters: {
        data: null,
        updated: new Date().getTime(),
      },
      volunteers: {
        data: [],
        updated: new Date().getTime(),
      },
      markers: {
        data: [],
        updated: new Date().getTime(),
      },
      news: {
        data: [],
        updated: new Date().getTime(),
      },
      setHero: (hero) =>
        set({ hero: { data: hero, updated: new Date().getTime() } }),
      setFooter: (footer) =>
        set({ footer: { data: footer, updated: new Date().getTime() } }),
      setAboutUs: (aboutUs) =>
        set({ aboutUs: { data: aboutUs, updated: new Date().getTime() } }),
      setFeatures: (features) =>
        set({ features: { data: features, updated: new Date().getTime() } }),
      setActionAreas: (actionAreas) =>
        set({
          actionAreas: { data: actionAreas, updated: new Date().getTime() },
        }),
      setSupporters: (supporters) =>
        set({
          supporters: { data: supporters, updated: new Date().getTime() },
        }),
      setVolunteers: (volunteers) =>
        set({
          volunteers: { data: volunteers, updated: new Date().getTime() },
        }),
      setMarkers: (markers) =>
        set({ markers: { data: markers, updated: new Date().getTime() } }),
      setNews: (news) =>
        set({ news: { data: news, updated: new Date().getTime() } }),
    }),
    {
      name: "cms",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
