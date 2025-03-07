export interface CreateRoleDto {
  name: string;
  base: boolean;
  validarCursinho: boolean;
  alterarPermissao: boolean;
  criarSimulado: boolean;
  visualizarQuestao: boolean;
  criarQuestao: boolean;
  validarQuestao: boolean;
  uploadNews: boolean;
  visualizarProvas: boolean;
  cadastrarProvas: boolean;
  visualizarDemanda: boolean;
  uploadDemanda: boolean;
  validarDemanda: boolean;
  gerenciadorDemanda: boolean;
  gerenciarProcessoSeletivo: boolean;
  gerenciarColaboradores: boolean;
  gerenciarTurmas: boolean;
  visualizarTurmas: boolean;
  gerenciarEstudantes: boolean;
  visualizarEstudantes: boolean;
  gerenciarPermissoesCursinho: boolean;
}