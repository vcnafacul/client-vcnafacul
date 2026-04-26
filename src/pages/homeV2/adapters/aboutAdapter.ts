// client-vcnafacul/src/pages/homeV2/adapters/aboutAdapter.ts
import { getHomeAbout } from "../../../services/home/getHomeAbout";
import { homeContentFile } from "../../../services/urls";
import tumble from "../../../assets/images/home/thumb-about-us.png";

export interface AboutSectionData {
  eyebrow: string;
  title: string;
  description: string;
  thumbnail: string;
  videoId: string;
}

const FALLBACK_DESCRIPTION =
  "Somos uma equipe de voluntários trabalhando por um bem maior: a *Educação*. Queremos que o ambiente universitário seja justo e igualitário, e que o desejo de ingressar no ensino superior não dependa de cor, gênero, orientação sexual ou classe social.";

export const aboutFallback: AboutSectionData = {
  eyebrow: "QUEM SOMOS",
  title: "Educação é ponte.",
  description: FALLBACK_DESCRIPTION,
  thumbnail: tumble,
  videoId: "LiNm9JxvNOM",
};

export async function fetchAboutSectionData(): Promise<AboutSectionData> {
  const res = await getHomeAbout();
  if (!res) return aboutFallback;
  return {
    eyebrow: "QUEM SOMOS",
    title: aboutFallback.title,
    description: res.description ?? aboutFallback.description,
    thumbnail: res.thumbnailUrl
      ? /^https?:\/\//.test(res.thumbnailUrl)
        ? res.thumbnailUrl
        : homeContentFile(res.thumbnailUrl)
      : aboutFallback.thumbnail,
    videoId: res.videoUrl ?? aboutFallback.videoId,
  };
}
