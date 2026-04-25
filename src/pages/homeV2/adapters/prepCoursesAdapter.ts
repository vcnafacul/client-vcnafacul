// client-vcnafacul/src/pages/homeV2/adapters/prepCoursesAdapter.ts
import { supporters as supportersFallback } from "../../../pages/home/data";

export interface PrepCourse {
  logoUrl: string;
  alt: string;
  link: string;
  city?: string;
  name?: string;
}

export const prepCoursesFallback: PrepCourse[] = supportersFallback.prepCourse
  .filter((p) => typeof p.image === "string")
  .map((p) => ({
    logoUrl: p.image as string,
    alt: p.alt,
    link: p.link,
    name: p.alt.replace(/^logo-/, "").toUpperCase(),
  }));

// No backend endpoint exists for prep courses today. Returns fallback constant.
// When an endpoint is added later, replace this body without touching the section component.
export async function fetchPrepCourses(): Promise<PrepCourse[]> {
  return prepCoursesFallback;
}
