import { HeaderProps } from "./types";

export const header: HeaderProps = {
    homeLink: "/",
    itemsMenu: [
        { id: 1, name: "Quem Somos", link: "/#about-us" },
        { id: 2,name: "Localize um Cursinho", link: "/#map" },
        { id: 3,name: "Apoiadores", link: "/#supporters" },
    ],
    socialLinks: {
        facebook: "https://www.facebook.com/vcnafacul/",
        linkedin: "https://www.linkedin.com/company/vcnafacul/",
        instagram: "https://www.instagram.com/vcnafacul/",
    },
    solid: false
};