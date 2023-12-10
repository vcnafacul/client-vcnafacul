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

export const simulado = `${BASE_URL}/simulado`
export const questoes = `${simulado}/questoes`
export const defaults = `${simulado}/default`
export const toAnswer = `${simulado}/toanswer`
export const answer = `${simulado}/answer`
export const report = `${simulado}/report`

export const news = `${BASE_URL}/news`
export const newsAll = `${news}/all`