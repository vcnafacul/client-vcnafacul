const BASE_URL = import.meta.env.VITE_BASE_URL;

export const userRoute = `${BASE_URL}/user`
export const login = `${userRoute}/login`
export const email_exist = `${userRoute}/hasemail`
export const role = `${BASE_URL}/role`
export const user_role = `${BASE_URL}/userrole`
export const roles_users = `${role}/users`

export const geolocations = `${BASE_URL}/geo`
export const validatedgeolocation = `${BASE_URL}/validatedgeolocation`
export const allGeolocation = `${geolocations}`

export const news = `${BASE_URL}/news`
export const newsAll = `${news}/all`

export const frentes = `${BASE_URL}/frente`
export const frentesByMateria = `${frentes}/materia`

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