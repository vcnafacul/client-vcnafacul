interface Cta {
    text: string;
    link: string;
}

interface Video {
    thumbnail: string;
    videoID: string;
}

export interface AboutUs {
    title: string;
    subtitle: string,
    cta: Cta,
    video: Video
}