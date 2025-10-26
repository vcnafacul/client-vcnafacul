export enum Roles {
  validarCursinho = "validarCursinho",
  alterarPermissao = "alterarPermissao",
  criarSimulado = "criarSimulado",
  visualizarQuestao = "visualizarQuestao",
  criarQuestao = "criarQuestao",
  validarQuestao = "validarQuestao",
  uploadNews = "uploadNews",
  visualizarProvas = "visualizarProvas",
  cadastrarProvas = "cadastrarProvas",
  visualizarDemanda = "visualizarDemanda",
  uploadDemanda = "uploadDemanda",
  validarDemanda = "validarDemanda",
  gerenciadorDemanda = "gerenciadorDemanda",
  gerenciarProcessoSeletivo = "gerenciarProcessoSeletivo",
  gerenciarColaboradores = "gerenciarColaboradores",
  gerenciarTurmas = "gerenciarTurmas",
  visualizarTurmas = "visualizarTurmas",
  gerenciarEstudantes = "gerenciarEstudantes",
  visualizarEstudantes = "visualizarEstudantes",
  gerenciarPermissoesCursinho = "gerenciarPermissoesCursinho",
  visualizarMinhasInscricoes = "visualizarMinhasInscricoes",
}

export const RolesLabel = [
  {
    value: Roles.validarCursinho,
    label: "Validar Cursinho",
    isProjectPermission: true,
  },
  {
    value: Roles.alterarPermissao,
    label: "Alterar Permissões",
    isProjectPermission: true,
  },
  {
    value: Roles.criarSimulado,
    label: "Visualizar Simulados",
    isProjectPermission: true,
  },
  {
    value: Roles.visualizarQuestao,
    label: "Visualizar Questões",
    isProjectPermission: true,
  },
  {
    value: Roles.criarQuestao,
    label: "Cadastrar Questões",
    isProjectPermission: true,
  },
  {
    value: Roles.validarQuestao,
    label: "Validar Questões",
    isProjectPermission: true,
  },
  {
    value: Roles.uploadNews,
    label: "Upload de Novidades",
    isProjectPermission: true,
  },
  {
    value: Roles.visualizarProvas,
    label: "Visualizar Provas",
    isProjectPermission: true,
  },
  {
    value: Roles.cadastrarProvas,
    label: "Cadastrar Provas",
    isProjectPermission: true,
  },
  {
    value: Roles.visualizarDemanda,
    label: "Visualizar Demandas",
    isProjectPermission: true,
  },
  {
    value: Roles.uploadDemanda,
    label: "Upload de Demandas",
    isProjectPermission: true,
  },
  {
    value: Roles.validarDemanda,
    label: "Validar Demandas",
    isProjectPermission: true,
  },
  {
    value: Roles.gerenciadorDemanda,
    label: "Gerenciar Demandas",
    isProjectPermission: true,
  },
  {
    value: Roles.gerenciarProcessoSeletivo,
    label: "Gerenciar Processos Seletivos",
    isProjectPermission: false,
  },
  {
    value: Roles.gerenciarColaboradores,
    label: "Gerenciar Colaboradores",
    isProjectPermission: false,
  },
  {
    value: Roles.gerenciarTurmas,
    label: "Gerenciar Turmas",
    isProjectPermission: false,
  },
  {
    value: Roles.visualizarTurmas,
    label: "Visualizar Turmas",
    isProjectPermission: false,
  },
  {
    value: Roles.gerenciarEstudantes,
    label: "Gerenciar Estudantes",
    isProjectPermission: false,
  },
  {
    value: Roles.visualizarEstudantes,
    label: "Visualizar Estudantes",
    isProjectPermission: false,
  },
  {
    value: Roles.gerenciarPermissoesCursinho,
    label: "Gerenciar Permissões do Cursinho",
    isProjectPermission: false,
  },
];
