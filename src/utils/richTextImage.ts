/**
 * Largura máxima de imagem no banco de questões — o mesmo número dos dois lados
 * do modal, de propósito.
 *
 * O editor sempre limitou a imagem a esta largura quando a questão não tem
 * width/height salvos (`ImageUploadExtension`), mas a visualização não limitava
 * nada: mostrava no tamanho natural, até a largura do container. Resultado: a
 * mesma questão tinha um tamanho antes de clicar em "Editar Conteúdo" e outro
 * depois.
 *
 * Mora aqui, e não no `ImageUploadExtension`, porque quem consome são um atom
 * (`RichTextRenderer`) e uma molecule (`richTextEditor`) — e porque o objetivo
 * é justamente os dois não poderem divergir.
 *
 * ⚠️ Aplicar só onde as duas visões convivem: o modal do banco de questões.
 * O `RichTextRenderer` também é o que o aluno vê durante o simulado, e limitar
 * a largura lá encolheria gráfico, mapa e tabela na prova — mudança de produto,
 * não de consistência. Por isso é uma prop opcional, não um padrão.
 */
export const RICH_TEXT_IMAGE_MAX_WIDTH = 300;
