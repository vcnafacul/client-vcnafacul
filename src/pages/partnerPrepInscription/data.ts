export interface SocioeconomicAnswer {
  question: string;
  answer: string | string[] | number | number[] | boolean;
}
export const stepDescriptions = {
  step1: "Informações Pessoais",
  step2: "Informações de Endereço",
  step3: "Representante Legal",
  step4: "Formulário Sócio-Econômico",
};

export const textoParceria = [
  "O caminho para ingressar em uma universidade pública no Brasil é cheio de desafios, especialmente para estudantes de escolas públicas ou de baixa renda. As universidades públicas, reconhecidas por sua excelência, são um sonho para muitos, mas a preparação necessária para chegar até elas pode parecer distante. É aí que entram os cursinhos populares, aliados importantes na democratização do acesso ao ensino superior.",

  "Os cursinhos populares são iniciativas que oferecem uma preparação acessível e de qualidade para o vestibular e o ENEM. Eles nasceram de movimentos sociais que queriam oferecer uma chance real para todos, independentemente de sua condição financeira, e têm sido uma fonte de apoio para milhares de jovens que desejam entrar na universidade pública.",

  "A parceria entre o Você na Facul (VNF) e os cursinhos populares presenciais busca justamente fortalecer essa trajetória de sucesso. Juntos, estamos oferecendo a você, estudante, uma plataforma que vai além da sala de aula, conectando o conhecimento acadêmico com ferramentas digitais que facilitam o seu progresso.",

  "Com essa parceria, você terá acesso a simulados, materiais de estudo gratuitos e, agora, com as funcionalidades do Você na Facul, você também poderá contar com o acompanhamento do seu cursinho de forma integrada, facilitando o seu processo de inscrição e garantindo que seu progresso seja acompanhado de perto.",

  "Seja bem-vindo! Estamos aqui para ajudar você a alcançar seus sonhos e entrar na universidade pública. Para começar, é só clicar no botão abaixo e fazer a sua inscrição.",
];

export const simNaoOptions = ["Sim", "Não"];

export const fundamentalMedioQuestion =
  "Em relação à sua escolaridade (ensino fundamental e médio)*";
export const fundamentalMedioOptions: string[] = [
  "Fiz toda em escola pública",
  "Fiz toda em escola particular com bolsa",
  "Fiz toda em escola particular sem bolsa",
  "Fiz a maior parte em escola particular com bolsa",
  "Fiz a maior parte em escola particular sem bolsa",
  "Fiz a maior parte em escola pública e parte em escola particular com bolsa",
  "Fiz a maior parte em escola pública e parte em escola particular sem bolsa",
  "Sesi ou Senai",
];

export const anoConclusaoQuestion =
  "Ano de conclusão do ensino médio regular ou que irá concluir*";

export const tipoCursoQuestion =
  "Qual tipo de curso de ensino médio você concluiu ou concluirá?*";
export const tipoCursoOptions = [
  "Ensino médio regular (comum)",
  "Curso técnico (ETEC ou outros)",
  "Educação de jovens e adultos (EJA)",
  "Curso para magistério (antigo Curso Normal)",
  "Certificação do Ensino Médio pelo Enem",
  "Certificação do Ensino Médio pelo ENCCEJA",
];

export const cursoUniversitarioQuestion =
  "Você já iniciou ou está frequentando algum curso superior (universidade, faculdade, instituto federal)?*";
export const cursoUniversitarioOptions = [
  "Não",
  "Sim, mas o abandonei",
  "Sim, estou cursando",
  "Sim e já o concluí",
];

export const instituicoesQuestion = "Em qual instituição?";
export const instituicoesOptions = [
  "ESTÁCIO",
  "FACERES",
  "FAMEMA",
  "FATEC",
  "IFSP",
  "UFSCar",
  "UNESP",
  "UNIARA",
  "UNICAMP",
  "UNICEP",
  "UNIP",
  "UNOPAR",
  "USP",
  "UNIFRAN",
  "Universidade Cruzeiro do Sul",
  "UNICESUMAR",
  "UNOESTE",
  "UNINTER",
  "Claretiano",
  "UNILASALLE",
  "Outra",
];

export const racaQuestion = "Qual sua cor ou raça?";
export const racaInputQuestion = "Descreva sua cor ou raça:";
export const racaOptions = [
  "Amarela",
  "Branca",
  "Indígena",
  "Parda",
  "Preta",
  "Não sei",
  "Outros",
];

export const etnicoRacialQuestion = "Qual seu pertencimento étnico-racial?";
export const etnicoRacialInputQuestion =
  "Descreva seu pertencimento étnico-racial:";
export const etnicoRacialOptions = [
  "Afrodescendente",
  "Branco",
  "Indígena",
  "Oriental/Asiático",
  "Não sei",
  "Outros",
];

export const deficienciaQuestion =
  "Sobre deficiências ou outras especificidades, especifique abaixo a(s) opção(ões) em que melhor se enquadra:";
export const deficienciaInputQuestion =
  "Descreva sua deficiência ou especificidade:";
export const deficienciaOptions = [
  "Não possuo deficiências ou outras especificidades",
  "Possuo deficiência motora (cadeirante ou com mobilidade reduzida)",
  "Possuo deficiência auditiva, mas não utilizo a língua brasileira de sinais (Libras) para me comunicar",
  "Sou surdo e utilizo a língua brasileira de sinais (Libras) para me comunicar",
  "Possuo deficiência visual",
  "Estou no espectro autista (TEA)",
  "Possuo Transtorno do Déficit de Atenção com Hiperatividade (TDAH)",
  "Tenho dislexia",
  "Outros",
];

export const civilQuestion = "Qual seu estado civil?";
export const civilOptions = [
  "Casada(o) (relacionamento em que duas pessoas vivam juntas, mesmo que a união não seja legalizada)",
  "Separada(o) judicialmente",
  "Separada(o) não judicialmente",
  "Solteira(o)",
  "Viúva(o)",
];

export const filhosQuestion = "Tem filhos(as)?";
export const filhosOptions = ["Sim, tenho filhas(os)", "Não tenho filhas(os)"];

export const filhosQuantidadeQuestion = "Quantas(os) filhas(os) você tem?";
export const filhosQuantidadeOptions = ["1", "2", "3", "4", "5", "Mais de 5"];

export const filhosResidencia = "Eles(as) moram com você?*";

export const pessoasQuantidadeCasa =
  "Quantas pessoas moram na sua casa, incluindo você?*";
export const pessoasQuantidadeOptions = ["1", "2", "3", "4", "5", "Mais de 5"];

export const adultosQuantidadeCasa =
  "Quantas pessoas de 16 anos ou mais, incluindo você, moram na casa?";
export const adultosQuantidadeOptions = ["1", "2", "3", "4", "5", "Mais de 5"];

export const pessoaEmpregoQuestion =
  "Quantas pessoas de 16 anos ou mais, incluindo você, possuem renda? (trabalha, recebe pensão e/ou aposentadoria)*";
export const pessoaEmpregoOptions = ["1", "2", "3", "4", "5", "Mais de 5"];

export const empregoQuestion = "Você exerce alguma atividade remunerada?*";
export const empregoOptions = [
  "Sim, eventualmente",
  "Sim, regularmente, em tempo parcial",
  "Sim, regularmente, em tempo integral",
];

export const profissaoQuestion =
  "Se você já trabalhou ou trabalha, qual a sua profissão?";

export const dependenteQuestion =
  "Há alguém dependente de sua renda que não mora com você ?*";

export const situacaoCasaQuestion =
  "Qual a sua situação de moradia e convivência doméstica?*";
export const situacaoCasaOptions = [
  "Mora sozinho(a)",
  "Mora com amigos(as)",
  "Mora com os pais ou responsaveis",
  "Tenho minha própria família e meus pais moram na mesma residência",
  "Tenho minha própria família e meus pais não moram na mesma residência",
];

export const dependenteFinanceiroQuestion =
  "Você depende financeiramente dos seus pais ou responsáveis?*";

export const maeOuResponsavelQuestion = "Nome da Mãe ou responsável*";

export const maeOuResponsavelEscolaridadeQuestion =
  "Sobre a escolaridade da sua mãe ou responsável:*";
export const responsavelEscolaridadeOptions = [
  "Escolaridade desconhecida",
  "Analfabeta / não estudou",
  "Primeiro ciclo (1ª a 4ª séries) do ensino fundamental incompleto",
  "Primeiro ciclo (1ª a 4ª séries) do ensino fundamental completo",
  "Segundo ciclo (5ª a 8ª séries) do ensino fundamental incompleto",
  "Segundo ciclo (5ª a 8ª séries) do ensino fundamental completo",
  "Ensino médio incompleto",
  "Ensino médio completo",
  "Ensino superior (faculdade) incompleto",
  "Ensino superior (faculdade) completo",
];

export const maeOuResposavelProfissaoQuestion =
  "Profissão atual de sua mãe ou responsável*";

export const maeOuResposavelProfissaoVidaQuestion =
  "Profissão que a mãe ou responsável exerceu a maior parte da vida*";

export const paiOuResponsavelQuestion = "Nome do Pai ou responsável*";

export const paiOuResponsavelEscolaridadeQuestion =
  "Sobre a escolaridade do seu pai ou responsável:*";

export const paiOuResposavelProfissaoQuestion =
  "Profissão atual do seu pai ou responsável*";

export const paiOuResposavelProfissaoVidaQuestion =
  "Profissão que o pai ou responsável exerceu a maior parte da vida*";

export const rendaFamiliarQuestion =
  "Qual é o valor aproximado da soma da renda de todas as pessoas da família?*";

export const rendaSoloQuestion =
  "Qual é o valor aproximado da sua renda individual?*";

export const rendaFamiliarOptions = [
  "Até R$303,00",
  "Entre R$303,01 até R$606,00",
  "Entre R$606,01 até R$909,00",
  "Entre R$909,01 até R$1212,00",
  "Entre R$1212,01 até R$1818,00",
  "Entre R$1818,01 até R$2424,00",
  "Entre R$2424,01 até R$3636,00",
  "Entre R$3636,01 até R$4848,00",
  "Entre R$4848,01 até R$6060,00",
  "Entre R$6060,01 até R$7272,00",
  "Entre R$7272,01 até R$8484,00",
  "Entre R$8484,01 até R$9696,00",
  "Mais do que R$9696,00",
];

export const moradiaSituacaoQuestion = "Qual a situação da sua moradia?*";
export const moradiaSituacaoOptions = [
  "Alugada",
  "Cedida/Emprestada",
  "Própria",
  "Financiada",
  "Outra",
];

export const moradiaComodoQuestion =
  "Quantos cômodos tem o local onde você mora (número de quartos, salas e cozinhas)? Não conte os banheiros.*";

export const moradiaBanheiroQuestion =
  "Quantos banheiros há no local onde você mora?*";

export const eletrodomésticosQuestion =
  "Selecione todos eletrodomésticos e eletrônicos que existem na sua casa:";

export const eletrodomésticosOptions = [
  "Ar condicionado",
  "Aspirador de pó",
  "Computador de mesa",
  "Computador portátil (notebook)",
  "Fogão",
  "Freezer",
  "Geladeira",
  "Home theater",
  "Máquina de lavar louça",
  "Máquina de lavar roupas",
  "Microondas",
  "Secadora de roupas",
  "Smart TV ou TV 4K",
  "Tablet ou iPad",
  "Tanquinho",
  "TV comum",
];

export const tvQuestion =
  "Quantas televisões de tela plana há na sua moradia?*";

export const pcQuestion =
  "Quantos computadores de mesa e notebooks há na sua moradia?*";

export const tvPcOptions = ["Não possuo", "1", "2", "3 ou mais"];

export const tvPagoQuestion =
  "Seu serviço de TV é pago? Ex: Claro NET, Sky etc.*";

export const streamingQuestion =
  "Você possui algum serviço de Streaming? Se sim, qual ou quais?";
export const streamingInputQuestion =
  "Qual outros serviços de streaming possui:";

export const streamingOptions = [
  "Não possuo",
  "Amazon Prime",
  "Disney+",
  "Globo Play",
  "HBO Max",
  "Netflix",
  "Star Plus",
  "Outros",
];

export const internetQuestion = "Você tem acesso à internet em sua casa?*";
export const internetOptions = [
  "Não",
  "Sim, através de internet a rádio (ex: SCW)",
  "Sim, através da internet cabeada e/ou wi-fi (ex: NET Claro, Vivo, internets locais)",
];

export const internetVelocidadeQuestion =
  "Qual seria a taxa de transferência de velocidade (velocidade de download) da internet via rádio, banda larga ou fibra óptica contratada?*";

export const internetVelocidadeOptions = [
  "Não sei",
  "Até 10 Mega",
  "De 11 a 50 Mega",
  "De 51 a 100 Mega",
  "De 101 a 300 Mega",
  "De 301 a 500 Mega",
  "De 501 Mega a 1 Giga",
  "Acima de 1 Giga",
];

export const internetCelularQuestion =
  "Você possui acesso à internet pelo aparelho celular (GSM, 2g, 3g, 4g)?*";

export const internetCelularOptions = [
  "Não",
  "Sim, apenas eventualmente por aparelho próprio",
  "Sim, apenas eventualmente por aparelho de outra pessoa",
  "Sim, regularmente por aparelho próprio",
  "Sim, regularmente por aparelho de outra pessoa",
];

export const internetCelularPlanoQuestion =
  "Se você possui acesso a internet pelo celular, qual seria a condição de plano que você utiliza?*";

export const internetCelularPlanoOptions = [
  "Pacotes limitados diários sem redes sociais ilimitadas",
  "Pacotes limitados diários com redes sociais ilimitadas",
  "Pacotes semanais, quinzenais ou mensais",
  "Plano Controle de qualquer natureza",
  "Plano pós-pago",
  "Outros",
];

export const energiaEletricaQuestion =
  "Selecione a opção mais adequada para representar o valor mensal aproximado de sua conta de energia elétrica:*";
export const aguaQuestion =
  "Selecione a opção mais adequada para representar o valor mensal aproximado de sua conta de água:*";

export const energiaEletricaAguaOptions = [
  "Até R$20,00",
  "Entre R$20,01 e R$50,00",
  "Entre R$50,01 e R$100,00",
  "Entre R$100,01 e R$200,00",
  "Mais de R$200,00",
];

export const transporteQuestion =
  "Qual(is) meio(s) de transporte você pretende utilizar para poder participar de nossas aulas presenciais na UFSCar - São Carlos?*";

export const transporteInputQuestion = "Descreva o meio de transporte:";
export const transporteOptions = [
  "Transporte público",
  "Carona",
  "Bicicleta",
  "Moto",
  "Carro",
  "Van fretada",
  "A pé",
  "Outros",
];

export const questions = [
  fundamentalMedioQuestion,
  anoConclusaoQuestion,
  tipoCursoQuestion,
  cursoUniversitarioQuestion,
  instituicoesQuestion,
  racaQuestion,
  racaInputQuestion,
  etnicoRacialQuestion,
  etnicoRacialInputQuestion,
  deficienciaQuestion,
  deficienciaInputQuestion,
  civilQuestion,
  filhosQuestion,
  filhosQuantidadeQuestion,
  filhosResidencia,
  pessoasQuantidadeCasa,
  adultosQuantidadeCasa,
  pessoaEmpregoQuestion,
  empregoQuestion,
  profissaoQuestion,
  dependenteQuestion,
  situacaoCasaQuestion,
  dependenteFinanceiroQuestion,
  maeOuResponsavelQuestion,
  maeOuResponsavelEscolaridadeQuestion,
  maeOuResposavelProfissaoQuestion,
  maeOuResposavelProfissaoVidaQuestion,
  paiOuResponsavelQuestion,
  paiOuResponsavelEscolaridadeQuestion,
  paiOuResposavelProfissaoQuestion,
  paiOuResposavelProfissaoVidaQuestion,
  rendaFamiliarQuestion,
  rendaSoloQuestion,
  moradiaSituacaoQuestion,
  moradiaComodoQuestion,
  moradiaBanheiroQuestion,
  eletrodomésticosQuestion,
  tvQuestion,
  tvPagoQuestion,
  pcQuestion,
  streamingQuestion,
  streamingInputQuestion,
  internetQuestion,
  internetVelocidadeQuestion,
  internetCelularQuestion,
  internetCelularPlanoQuestion,
  energiaEletricaQuestion,
  aguaQuestion,
  transporteQuestion,
  transporteInputQuestion,
]

export const ptBr = {
  "pt-br": {
    accept: "Sim",
    addRule: "Adicionar Regra",
    am: "AM",
    apply: "Aplicar",
    cancel: "Cancelar",
    choose: "Escolher",
    chooseDate: "Escolher Data",
    chooseMonth: "Escolher Mês",
    chooseYear: "Escolher Ano",
    clear: "Limpar",
    completed: "Concluído",
    contains: "Contém",
    custom: "Personalizado",
    dateAfter: "Data depois de",
    dateBefore: "Data antes de",
    dateFormat: "dd/MM/yy",
    dateIs: "Data é",
    dateIsNot: "Data não é",
    dayNames: [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ],
    dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
    dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    emptyFilterMessage: "Nenhum resultado encontrado",
    emptyMessage: "Nenhuma opção disponível",
    emptySearchMessage: "Nenhum resultado encontrado",
    emptySelectionMessage: "Nenhum item selecionado",
    endsWith: "Termina com",
    equals: "Igual",
    fileSizeTypes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    filter: "Filtro",
    firstDayOfWeek: 0,
    gt: "Maior que",
    gte: "Maior ou igual a",
    lt: "Menor que",
    lte: "Menor ou igual a",
    matchAll: "Corresponder Todos",
    matchAny: "Corresponder Qualquer",
    medium: "Médio",
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    monthNamesShort: [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ],
    nextDecade: "Próxima Década",
    nextHour: "Próxima Hora",
    nextMinute: "Próximo Minuto",
    nextMonth: "Próximo Mês",
    nextSecond: "Próximo Segundo",
    nextYear: "Próximo Ano",
    noFilter: "Sem Filtro",
    notContains: "Não contém",
    notEquals: "Diferente",
    now: "Agora",
    passwordPrompt: "Digite uma senha",
    pending: "Pendente",
    pm: "PM",
    prevDecade: "Década Anterior",
    prevHour: "Hora Anterior",
    prevMinute: "Minuto Anterior",
    prevMonth: "Mês Anterior",
    prevSecond: "Segundo Anterior",
    prevYear: "Ano Anterior",
    reject: "Não",
    removeRule: "Remover Regra",
    searchMessage: "Existem {0} resultados disponíveis",
    selectionMessage: "{0} itens selecionados",
    showMonthAfterYear: false,
    startsWith: "Começa com",
    strong: "Forte",
    today: "Hoje",
    upload: "Enviar",
    weak: "Fraco",
    weekHeader: "Sem",
    aria: {
      cancelEdit: "Cancelar Edição",
      close: "Fechar",
      collapseLabel: "Colapso",
      collapseRow: "Recolher Linha",
      editRow: "Editar Linha",
      expandLabel: "Expandir",
      expandRow: "Expandir Linha",
      falseLabel: "Falso",
      filterConstraint: "Restrição de Filtro",
      filterOperator: "Operador de Filtro",
      firstPageLabel: "Primeira Página",
      gridView: "Visualização de Grade",
      hideFilterMenu: "Esconder Menu de Filtro",
      jumpToPageDropdownLabel: "Ir para a Página",
      jumpToPageInputLabel: "Ir para a Página",
      lastPageLabel: "Última Página",
      listView: "Visualização de Lista",
      moveAllToSource: "Mover Todos para a Origem",
      moveAllToTarget: "Mover Todos para o Destino",
      moveBottom: "Mover para o Final",
      moveDown: "Mover para Baixo",
      moveTop: "Mover para o Topo",
      moveToSource: "Mover para a Origem",
      moveToTarget: "Mover para o Destino",
      moveUp: "Mover para Cima",
      navigation: "Navegação",
      next: "Próximo",
      nextPageLabel: "Próxima Página",
      nullLabel: "Não Selecionado",
      otpLabel: "Insira o caractere da senha de uso único {0}",
      pageLabel: "Página {page}",
      passwordHide: "Esconder a senha",
      passwordShow: "Mostrar senha",
      previous: "Anterior",
      previousPageLabel: "Página Anterior",
      removeLabel: "Remover",
      rotateLeft: "Rotacionar para a Esquerda",
      rotateRight: "Rotacionar para a Direita",
      rowsPerPageLabel: "Linhas por página",
      saveEdit: "Salvar Edição",
      scrollTop: "Rolar para o Topo",
      selectAll: "Todos os itens selecionados",
      selectLabel: "Selecione",
      selectRow: "Linha Selecionada",
      showFilterMenu: "Mostrar Menu de Filtro",
      slide: "Deslizar",
      slideNumber: "Slide {slideNumber}",
      star: "1 estrela",
      stars: "{star} estrelas",
      trueLabel: "Verdadeiro",
      unselectAll: "Todos os itens desmarcados",
      unselectLabel: "Desmarcar",
      unselectRow: "Linha Desmarcada",
      zoomImage: "Ampliar Imagem",
      zoomIn: "Ampliar",
      zoomOut: "Reduzir",
    },
  },
};
