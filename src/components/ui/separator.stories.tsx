import type { Meta, StoryObj } from "@storybook/react-vite"

import { Separator } from "./separator"

const meta = {
  title: "Componentes/Separator",
  component: Separator,
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="max-w-form">
      <p className="text-body">Dados da prova</p>
      <Separator className="my-3" />
      <p className="text-body">Questões</p>
    </div>
  ),
}
export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center gap-3 text-body">
      <span>Provas</span>
      <Separator orientation="vertical" />
      <span>Simulados</span>
      <Separator orientation="vertical" />
      <span>Questões</span>
    </div>
  ),
}
