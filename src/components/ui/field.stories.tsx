import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field, FormLegend } from "./field"
import { Input } from "./input"
import { Textarea } from "./textarea"

const meta = {
  title: "Componentes/Field",
  component: Field,
  tags: ["autodocs"],
  args: {
    label: "Nome da prova",
    children: <Input placeholder="Ex.: ENEM 2025" />,
  },
  argTypes: {
    required: { control: "boolean" },
    hint: { control: "text" },
    error: { control: "text" },
    maxLength: { control: "number" },
  },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithHint: Story = {
  args: { hint: "Aparece para os alunos na lista de simulados." },
}
export const Required: Story = {
  render: (args) => (
    <div className="grid gap-3">
      <Field {...args} required />
      <FormLegend />
    </div>
  ),
}
export const WithError: Story = {
  args: {
    label: "Ano",
    error: "Ano deve ter 4 dígitos.",
    children: <Input defaultValue="20255" />,
  },
}
export const WithCounter: Story = {
  args: {
    label: "Observações",
    maxLength: 500,
    hint: "Visível só para a equipe.",
    children: <Textarea placeholder="Escreva aqui…" />,
  },
}
export const Legend: Story = {
  render: () => <FormLegend />,
}
