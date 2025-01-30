import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { News } from "../../dtos/news/news";
import { Marker } from "../../types/map/marker";

export type HomeState = {
  markers: {
    data: Marker[];
    updated: number;
  };
  news: {
    data: News[];
    updated: number;
  };
  setMarkers: (markers: Marker[]) => void;
  setNews: (news: News[]) => void;
};

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      markers: {
        data: [],
        updated: new Date().getTime(),
      },
      news: {
        data: [],
        updated: new Date().getTime(),
      },
      setMarkers: (markers) =>
        set({ markers: { data: markers, updated: new Date().getTime() } }),
      setNews: (news: News[]) =>
        set({ news: { data: news, updated: new Date().getTime() } }),
    }),
    {
      name: "cms",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
