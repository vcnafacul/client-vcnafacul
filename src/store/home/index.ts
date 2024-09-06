import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Volunteer } from "../../components/organisms/supporters";
import { News } from "../../dtos/news/news";
import { Marker } from "../../types/map/marker";

export type HomeState = {
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
  setVolunteers: (volunteers: Volunteer[]) => void;
  setMarkers: (markers: Marker[]) => void;
  setNews: (news: News[]) => void;
};

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
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
