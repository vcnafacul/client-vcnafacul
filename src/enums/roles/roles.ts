export enum Roles {
    validarCursinho = "validarCursinho",
    alterarPermissao = "alterarPermissao",
    criarSimulado = "criarSimulado",
    visualizarQuestao = "visualizarQuestao",
    criarQuestao = "criarQuestao",
    validarQuestao = "validarQuestao",
    uploadNews = "uploadNews",
    visualizarProvas = 'visualizarProvas',
    cadastrarProvas = 'cadastrarProvas'
}

export const RolesLabel = [
    { value: Roles.validarCursinho, label: 'Validar Cursinho'},
    { value: Roles.alterarPermissao, label: 'Alterar Permissões'},
    { value: Roles.criarSimulado, label: 'Criar Simulados'},
    { value: Roles.visualizarQuestao, label: 'Visualizar Questões'},
    { value: Roles.criarQuestao, label: 'Cadastrar Questões'},
    { value: Roles.validarQuestao, label: 'Validar Questões'},
    { value: Roles.uploadNews, label: 'Upload de Novidades'},
    { value: Roles.visualizarProvas, label: 'Visualizar Provas'},
    { value: Roles.cadastrarProvas, label: 'Cadastrar Provas'},
]