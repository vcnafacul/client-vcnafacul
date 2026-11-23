export interface SocioeconomicAnswer {
  questionId: string;
  question: string;
  answer: string | string[] | number | number[] | boolean;
}

export const stepDescriptions = {
  step1: "Informações Pessoais",
  step2: "Informações de Endereço",
  step3: "Representante Legal",
};

export const textoParceria = [
  "O caminho para ingressar em uma universidade pública no Brasil é cheio de desafios, especialmente para estudantes de escolas públicas ou de baixa renda. As universidades públicas, reconhecidas por sua excelência, são um sonho para muitos, mas a preparação necessária para chegar até elas pode parecer distante. É aí que entram os cursinhos populares, aliados importantes na democratização do acesso ao ensino superior.",

  "Os cursinhos populares são iniciativas que oferecem uma preparação acessível e de qualidade para o vestibular e o ENEM. Eles nasceram de movimentos sociais que queriam oferecer uma chance real para todos, independentemente de sua condição financeira, e têm sido uma fonte de apoio para milhares de jovens que desejam entrar na universidade pública.",

  "A parceria entre o Você na Facul (VNF) e os cursinhos populares presenciais busca justamente fortalecer essa trajetória de sucesso. Juntos, estamos oferecendo a você, estudante, uma plataforma que vai além da sala de aula, conectando o conhecimento acadêmico com ferramentas digitais que facilitam o seu progresso.",

  "Com essa parceria, você terá acesso a simulados, materiais de estudo gratuitos e, agora, com as funcionalidades do Você na Facul, você também poderá contar com o acompanhamento do seu cursinho de forma integrada, facilitando o seu processo de inscrição e garantindo que seu progresso seja acompanhado de perto.",

  "Seja bem-vindo! Estamos aqui para ajudar você a alcançar seus sonhos e entrar na universidade pública. Para começar, é só clicar no botão abaixo e fazer a sua inscrição.",
];

export const parentescoOptions = [
  "Mãe",
  "Pai",
  "Avó",
  "Avô",
  "Tia",
  "Tio",
  "Irmã",
  "Irmão",
  "Prima",
  "Primo",
  "Outro",
];
