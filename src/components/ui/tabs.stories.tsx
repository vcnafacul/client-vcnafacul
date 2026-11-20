import type { Meta, StoryObj } from "@storybook/react-vite"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"

// Só sublinhado. Aba troca conteúdo; para escolher um valor, use o SegmentedControl (D17).
const meta = {
  title: "Componentes/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: { defaultValue: "enunciado" },
  render: (args) => (
    <Tabs {...args} className="max-w-form">
      <TabsList>
        <TabsTrigger value="enunciado">Enunciado</TabsTrigger>
        <TabsTrigger value="alternativas">Alternativas</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
      </TabsList>
      <TabsContent value="enunciado" className="text-body">Texto do enunciado.</TabsContent>
      <TabsContent value="alternativas" className="text-body">As cinco alternativas.</TabsContent>
      <TabsContent value="historico" className="text-body">Quem mexeu e quando.</TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const SecondActive: Story = { args: { defaultValue: "alternativas" } }
export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="dados" className="max-w-form">
      <TabsList>
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="questoes" disabled>
          Questões
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dados" className="text-body">Salve a prova para liberar as questões.</TabsContent>
    </Tabs>
  ),
}
