const BASE_URL = import.meta.env.VITE_BASE_URL;
const CMS_URL = import.meta.env.VITE_CMS_URL;

export const user = `${BASE_URL}/user`;
export const login = `${user}/login`;
export const forgot = `${user}/forgot`;
export const reset = `${user}/reset`;
export const confirmemail = `${user}/confirmemail`;
export const email_exist = `${user}/hasemail`;
export const role = `${BASE_URL}/role`;
export const roles_users = `${role}/users`;

export const geolocations = `${BASE_URL}/geo`;
export const validatedgeolocation = `${BASE_URL}/validatedgeolocation`;
export const allGeolocation = `${geolocations}`;

export const news = `${BASE_URL}/news`;
export const newsAll = `${BASE_URL}/news/all`;

export const frentes = `${BASE_URL}/frente`;
export const frentesByMateria = `${frentes}/materia`;
export const frentesByMateriaWithContent = `${frentes}/materiawithcontent`;

export const subject = `${BASE_URL}/subject`;
export const subjectsByFrente = `${subject}/frente`;

export const content = `${BASE_URL}/content`;
export const demand = `${content}/demand`;

export const mssimulado = `${BASE_URL}/mssimulado`;

export const simulado = `${mssimulado}/simulado`;
export const tipos = `${simulado}/tipos`;
export const toAnswer = `${simulado}/toanswer`;
export const answer = `${simulado}/answer`;
export const report = `${simulado}/report`;

export const prova = `${mssimulado}/prova`;
export const missing = `${prova}/missing`;
export const questoes = `${mssimulado}/questoes`;
export const historico = `${mssimulado}/historico`;
export const auditLog = `${BASE_URL}/auditlog`;
export const auditLogMs = `${BASE_URL}/auditlog/ms`;
export const historyQuestion = `${mssimulado}/questoes/history`;

export const hero = `${CMS_URL}/items/Home_Hero_Slides?fields=id,title,subtitle,image,backgroud_color,links.Home_Hero_Button_id.*`;
export const about_us = `${CMS_URL}/items/Home_About_Us`;
export const features = `${CMS_URL}/items/Home_Feature?fields=id,title,subtitle,items.Home_Features_Item_id.*`;
export const actions = `${CMS_URL}/items/Home_Action?fields=id,title,subtitle,areas.Home_Action_Area_id.*.Home_Action_Area_Item_id.*`;
export const sponsors = `${CMS_URL}/items/Home_Supporters?fields=id,title,subtitle,sponsors.Patrocinador_id.*`;
export const footer = `${CMS_URL}/items/Home_Footer?fields=id,slogan,contact,pageLinks.Home_Menu_Item_id.*,sitemapLinks.Home_Menu_Item_id.*,socialLinks.Home_Menu_Item_id.*`;
export const header = (id: number) =>
  `${CMS_URL}/items/Headers/${id}?fields=id,pageLinks.Home_Menu_Item_id.*,userNavigationSign.Home_Menu_Item_id.*,socialLinks.Home_Menu_Item_id.*,userNavigationLogged.Home_Menu_Item_id.*`;
export const university = `${CMS_URL}/items/Universidade`;

export const partnerPrepCourse = `${BASE_URL}/partner-prep-course`;

export const prepCourse = (id: string) =>
  `${partnerPrepCourse}/${id}/has-active-inscription`;
export const studentCourse = `${BASE_URL}/student-course`;
export const get_user_info = (idPrepCourse: string) =>
  `${studentCourse}/get-user-info/${idPrepCourse}`;

export const inscriptionCourse = `${BASE_URL}/inscription-course`;
export const subscribers = `${inscriptionCourse}/subscribers`;
export const inviteMember = `${partnerPrepCourse}/invite-members`;
export const inviteMemberAccept = `${partnerPrepCourse}/invite-members-accept`;
export const updateWaitingList = `${inscriptionCourse}/update-waiting-list`;
export const updateOrderWaitingList = `${inscriptionCourse}/update-order-waiting-list`;
export const getWaitingList = `${inscriptionCourse}/waiting-list`;
export const sendWaitingList = `${inscriptionCourse}/send-waiting-list`;
export const uploadDocuments = `${studentCourse}/upload`;
export const getDocument = `${studentCourse}/document`;
export const uploadProfilePhoto = `${studentCourse}/profile-photo`;
export const getProfilePhotos = `${studentCourse}/profile-photo`;
export const declaredInterest = `${studentCourse}/declared-interest`;
export const enrolled = `${studentCourse}/enrolled`;
export const uploadPhotoProfile = `${studentCourse}/profile-image`;
export const collaborator = `${BASE_URL}/collaborator`;
export const classes = `${BASE_URL}/class`;

export const attendanceRecord = `${BASE_URL}/attendance-record`;
export const studentAttendance = `${BASE_URL}/student-attendance`;
