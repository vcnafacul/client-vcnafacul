import { HeaderProps } from "../../components/organisms/header";
import {header}  from "../Home/data";

export const headerDash: HeaderProps = {...header, itemsMenu: [
    { id: 1, name: "Forum", link: "#" },
    { id: 2,name: "Simulado", link: "#" },
    { id: 3,name: "Redações", link: "#" },
    { id: 4,name: "Blog", link: "#" },
],};

