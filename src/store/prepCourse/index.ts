import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initialPrepCourse = {
  id: "",
  prepCourseName: "",
};

export type PrepCourseProps = {
  id: string;
  prepCourseName: string;
};

type PrepCourseState = {
  data: PrepCourseProps;
  setPrepCourse: (prep: PrepCourseProps) => void;
};

export const usePrepCourseStore = create<PrepCourseState>()(
  persist(
    (set) => ({
      data: initialPrepCourse,
      setPrepCourse: (prep: PrepCourseProps) => set({ data: prep }),
    }),
    {
      name: "prep-course-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
