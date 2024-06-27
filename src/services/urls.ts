const BASE_URL = import.meta.env.VITE_BASE_URL;
const CMS_URL = import.meta.env.VITE_CMS_URL;

export const user = `${BASE_URL}/user`
export const login = `${user}/login`
export const forgot = `${user}/forgot`
export const reset = `${user}/reset`
export const confirmemail = `${user}/confirmemail`
export const email_exist = `${user}/hasemail`
export const role = `${BASE_URL}/role`
export const user_role = `${BASE_URL}/userrole`
export const roles_users = `${role}/users`

export const geolocations = `${BASE_URL}/geo`
export const validatedgeolocation = `${BASE_URL}/validatedgeolocation`
export const allGeolocation = `${geolocations}`

export const news = `${BASE_URL}/news`

export const frentes = `${BASE_URL}/frente`
export const frentesByMateria = `${frentes}/materia`
export const frentesByMateriaWithContent = `${frentes}/materiawithcontent`

export const subject = `${BASE_URL}/subject`
export const subjectsByFrente = `${subject}/frente`

export const content = `${BASE_URL}/content`
export const demand = `${content}/demand`

export const mssimulado = `${BASE_URL}/mssimulado`

export const simulado = `${mssimulado}/simulado`
export const tipos = `${simulado}/tipos`
export const toAnswer = `${simulado}/toanswer`
export const answer = `${simulado}/answer`
export const report = `${simulado}/report`


export const prova = `${mssimulado}/prova`
export const missing = `${prova}/missing`
export const questoes = `${mssimulado}/questoes`
export const historico = `${mssimulado}/historico`

export const hero = `${CMS_URL}/items/Home_Hero_Slides?fields=id,title,subtitle,image,backgroud_color,links.Home_Hero_Button_id.*`
export const about_us = `${CMS_URL}/items/Home_About_Us`
export const features = `${CMS_URL}/items/Home_Feature?fields=id,title,subtitle,items.Home_Features_Item_id.*`
export const actions = `${CMS_URL}/items/Home_Action?fields=id,title,subtitle,areas.Home_Action_Area_id.*.Home_Action_Area_Item_id.*`
export const sponsors = `${CMS_URL}/items/Home_Supporters?fields=id,title,subtitle,sponsors.Patrocinador_id.*`
export const footer = `${CMS_URL}/items/Home_Footer?fields=id,slogan,contact,pageLinks.Home_Menu_Item_id.*,sitemapLinks.Home_Menu_Item_id.*,socialLinks.Home_Menu_Item_id.*`
export const header = (id: number) => `${CMS_URL}/items/Headers/${id}?fields=id,pageLinks.Home_Menu_Item_id.*,userNavigationSign.Home_Menu_Item_id.*,socialLinks.Home_Menu_Item_id.*,userNavigationLogged.Home_Menu_Item_id.*`
export const university = `${CMS_URL}/items/Universidade`