import type { Meta, StoryObj } from "@storybook/react-vite"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"

// Substitui o Collapse do MUI e o cursinhoAccordin (tickets/059 §3).
const ITENS = [
  { value: "inscricao", titulo: "Como faço a inscrição?", texto: "Escolha o cursinho e preencha o formulário do processo seletivo." },
  { value: "custo", titulo: "O cursinho é pago?", texto: "Os cursinhos parceiros são gratuitos ou cobram uma taxa social." },
  { value: "documentos", titulo: "Quais documentos preciso enviar?", texto: "RG, CPF e o comprovante de escolaridade." },
]

const meta = {
  title: "Componentes/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: { type: "single", collapsible: true },
  render: (args) => (
    <Accordion {...args} className="max-w-form">
      {ITENS.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>{item.titulo}</AccordionTrigger>
          <AccordionContent>{item.texto}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Open: Story = { args: { type: "single", collapsible: true, defaultValue: "custo" } }
export const Multiple: Story = {
  args: { type: "multiple", defaultValue: ["inscricao", "documentos"] },
}
export const DisabledItem: Story = {
  render: () => (
    <Accordion type="single" collapsible className="max-w-form">
      <AccordionItem value="a">
        <AccordionTrigger>Disponível</AccordionTrigger>
        <AccordionContent>Conteúdo.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b" disabled>
        <AccordionTrigger>Indisponível por enquanto</AccordionTrigger>
        <AccordionContent>Conteúdo.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
