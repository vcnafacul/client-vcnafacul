const BASE_URL = import.meta.env.VITE_BASE_URL;

/** Endpoint para envio de erros do frontend (falhas que o back nunca viu) */
export const frontendErrors = `${BASE_URL}/frontend-errors`;

export const user = `${BASE_URL}/user`;
export const login = `${user}/login`;
export const refresh = `${user}/refresh`;
export const logout = `${user}/logout`;
export const logoutAll = `${user}/logout-all`;
export const forgot = `${user}/forgot`;
export const reset = `${user}/reset`;
export const confirmemail = `${user}/confirmemail`;
export const email_exist = `${user}/hasemail`;
export const role = `${BASE_URL}/role`;
export const roles_users = `${role}/users`;
export const user_aggregate = `${user}/aggregate`;
export const user_aggregate_role = `${user}/aggregate-role`;
export const user_aggregate_last_access = `${user}/aggregate-last-access`;
export const send_bulk_email = `${user}/send-bulk-email`;

export const geolocations = `${BASE_URL}/geo`;
export const validatedgeolocation = `${BASE_URL}/validatedgeolocation`;
export const allGeolocation = `${geolocations}`;
export const geo_summary_status = `${geolocations}/summary-status`;

export const places = `${BASE_URL}/places`;
export const placesDetails = `${places}/details`;

export const news = `${BASE_URL}/news`;
export const newsAll = `${BASE_URL}/news/all`;

export const materias = `${BASE_URL}/materia`;

export const frentes = `${BASE_URL}/frente`;
export const frentesByMateria = `${frentes}/materia`;
export const frentesByMateriaWithContent = `${frentes}/materiawithcontent`;

export const subject = `${BASE_URL}/subject`;
export const subjectsByFrente = `${subject}/frente`;

export const content = `${BASE_URL}/content`;
export const demand = `${content}/demand`;
export const content_stats_by_frente = `${content}/stats-by-frente`;
export const content_snapshot_status = `${content}/snapshot-content-status`;
export const content_summary = `${content}/summary`;

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
export const question_summary = `${mssimulado}/questoes/summary`;
export const prova_summary = `${mssimulado}/prova/summary`;
export const historicoByPeriod = `${historico}/aggregate-by-period`;
export const historicoByPeriodAndType = `${historico}/aggregate-by-period-and-type`;
export const historico_summary = `${historico}/summary`;

export const partnerPrepCourse = `${BASE_URL}/partner-prep-course`;
export const partnerPrepCourseLogos = `${partnerPrepCourse}/logos`;
export const partnerPrepCourseAggregate = `${partnerPrepCourse}/aggregate`;

export const prepCourse = (id: string) =>
  `${partnerPrepCourse}/${id}/has-active-inscription`;

export const studentCourse = `${BASE_URL}/student-course`;
export const registrationMonitoring = `${studentCourse}/registration-monitoring`;
export const get_user_info = (inscriptionId: string) =>
  `${studentCourse}/get-user-info/${inscriptionId}`;
export const aggregateStudentCourse = `${studentCourse}/aggregate`;
export const summaryStudentCourse = `${studentCourse}/summary`;
export const inscriptionCourse = `${BASE_URL}/inscription-course`;
export const inscriptionCourseWithName = `${inscriptionCourse}/all-with-name`;
export const aggregateInscriptionCourse = `${inscriptionCourse}/aggregate`;
export const subscribers = `${inscriptionCourse}/subscribers`;
export const inviteMember = `${partnerPrepCourse}/invite-members`;
export const inviteMemberAccept = `${partnerPrepCourse}/invite-members-accept`;
export const termOfUse = `${partnerPrepCourse}/term-of-use`;
export const getPartnerLogo = `${partnerPrepCourse}/logo`;
export const updateWaitingList = `${inscriptionCourse}/update-waiting-list`;
export const updateOrderWaitingList = `${inscriptionCourse}/update-order-waiting-list`;
export const getWaitingList = `${inscriptionCourse}/waiting-list`;
export const sendWaitingList = `${inscriptionCourse}/send-waiting-list`;
export const summaryInscriptionCourse = `${inscriptionCourse}/summary`;
export const uploadDocuments = `${studentCourse}/upload`;
export const getDocument = `${studentCourse}/document`;
export const enrollmentCertificate = `${studentCourse}/enrollment-certificate`;
export const uploadProfilePhoto = `${studentCourse}/profile-photo`;
export const getProfilePhotos = `${studentCourse}/profile-photo`;
export const declaredInterest = `${studentCourse}/declared-interest`;
export const declarationDocuments = `${studentCourse}/declaration-documents`;
export const declarationPhoto = `${studentCourse}/declaration-photo`;
export const declarationSurvey = `${studentCourse}/declaration-survey`;
export const declarationConfirm = `${studentCourse}/declaration-confirm`;
export const enrollmentStatus = `${studentCourse}/verify-enrollment-status`;
export const enrolled = `${studentCourse}/enrolled`;
export const uploadPhotoProfile = `${studentCourse}/profile-image`;
export const collaborator = `${BASE_URL}/collaborator`;
export const collaborator_frentes_batch = `${collaborator}/frentes/batch`;
export const classes = `${BASE_URL}/class`;

export const attendanceRecord = `${BASE_URL}/attendance-record`;
export const studentAttendance = `${BASE_URL}/student-attendance`;
export const periodJustification = `${BASE_URL}/period-justification`;

export const section_form = `${BASE_URL}/section-form`;
export const question_form = `${BASE_URL}/question-form`;

export const admin_form = `${BASE_URL}/admin-form`;
export const admin_section_form = `${admin_form}/section`;
export const admin_question_form = `${admin_form}/question`;
export const rule_form = `${BASE_URL}/rule-form`;
export const rule_set_form = `${BASE_URL}/rule-set-form`;

export const coursePeriod = `${BASE_URL}/course-period`;

export const essay = `${BASE_URL}/essay`;
export const essayTheme = `${essay}/theme`;
export const essayThemeCurrent = `${essayTheme}/current`;
export const essayThemeAvailable = `${essayTheme}/available`;
export const essayMy = `${essay}/my`;
export const essayMyStats = `${essayMy}/stats`;
export const essaySettings = `${essay}/settings`;
export const essayAll = `${essay}/all`;
export const essayAllCount = `${essayAll}/count`;
export const essayMyCursinho = `${essay}/my-cursinho`;
export const essayPrepCourse = (prepCourseId: string) =>
  `${essay}/prep-course/${prepCourseId}`;
export const essayReviews = (essayId: string) => `${essay}/${essayId}/reviews`;
export const essayReview = (essayId: string) => `${essay}/${essayId}/review`;
export const essaySubmitImage = `${essay}/submit-image`;
export const essayImage = (essayId: string) => `${essay}/${essayId}/image`;

export const inscriptionCourseOpen = `${inscriptionCourse}/open`;
export const dashboard = `${BASE_URL}/dashboard`;
export const dashboardStudent = `${dashboard}/student`;
export const dashboardCollaborator = `${dashboard}/collaborator`;
export const dashboardQuestoesPendentes = `${dashboard}/questoes-pendentes`;
export const essayMyCursinhoCount = `${essayMyCursinho}/count`;
