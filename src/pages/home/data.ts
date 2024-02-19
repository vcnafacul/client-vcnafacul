import { ItemMenuProps } from '../../components/molecules/menuItems';
import { HeaderProps } from '../../components/organisms/header';
import { ACCOUNT_PATH, DASH, LOGIN_PATH, LOGOFF_PATH, NEWS, REGISTER_PATH } from "../../routes/path";

export const userNavigationSign : ItemMenuProps[] = [
    { Home_Menu_Item_id: {
        id: 1, name: 'Cadastro', link: REGISTER_PATH, target: '_self'
    }},
    {
        Home_Menu_Item_id: {
            id: 2, name: 'Login', link: LOGIN_PATH, target: '_self'
    }},
  ]

export const userNavigationLogged : ItemMenuProps[] = [
    { Home_Menu_Item_id: {
        id: 1, name: 'DashBoard', link: DASH, target: '_self'
    }},
    {
        Home_Menu_Item_id: {
            id: 2, name: 'Editar Perfil', link: `/dashboard/${ACCOUNT_PATH}`, target: '_self'
    }},
    {
        Home_Menu_Item_id: {
            id: 2, name: 'Sair', link: LOGOFF_PATH, target: '_self'
    }},
  ]

export const header: HeaderProps = {
    pageLinks: [
        {Home_Menu_Item_id : { id: 1, name: "Quem Somos", link: "/#about-us", target: '_self' }},
        {Home_Menu_Item_id : { id: 2, name: "Localize um Cursinho", link: "/#map", target: '_self' },},
        {Home_Menu_Item_id : { id: 3, name: "Apoiadores", link: "/#supporters", target: '_self' },},
        {Home_Menu_Item_id : { id: 4, name: "Novidades", link: NEWS, target: '_self' },}
    ],
    socialLinks: [
        {Home_Menu_Item_id : { id: 5, name: "Facebook", link: "https://www.facebook.com/vcnafacul/", target: '_blank' }},
        {Home_Menu_Item_id : { id: 6, name: "Linkedin", link: "https://www.linkedin.com/company/vcnafacul/", target: '_blank' }},
        {Home_Menu_Item_id : { id: 7, name: "Instagram", link: "https://www.instagram.com/vcnafacul/", target: '_blank' }},
        {Home_Menu_Item_id : { id: 8, name: "Quem Somos", link: "https://www.facebook.com/vcnafacul/", target: '_blank' }},
    ],
    userNavigationSign: userNavigationSign,
    userNavigationLogged: userNavigationLogged,
    solid: false,
};