export interface CreateRoleDto {
    name: string;
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
}