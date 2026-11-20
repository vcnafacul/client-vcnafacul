import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "./input"
import { Label } from "./label"

// Em formulário, prefira o Field, que já liga o rótulo, a dica e o erro.
const meta = {
  title: "Componentes/Label",
  component: Label,
  tags: ["autodocs"],
  args: { children: "Nome da prova", htmlFor: "nome" },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="grid max-w-form gap-1.5">
      <Label {...args} />
      <Input id="nome" />
    </div>
  ),
}
export const Disabled: Story = {
  render: (args) => (
    <div className="grid max-w-form gap-1.5">
      <Input id="nome" disabled className="peer order-2" />
      <Label {...args} className="order-1" />
    </div>
  ),
}
