import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field } from "./field"
import { OptionsSelect } from "./options-select"

const meta = {
  title: "Componentes/OptionsSelect",
  component: OptionsSelect,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof OptionsSelect>

export default meta
type Story = StoryObj<typeof meta>

const gender = [
  { value: 1, label: "Masculino" },
  { value: 2, label: "Feminino" },
  { value: 3, label: "Outro" },
]
const long = Array.from({ length: 14 }, (_, i) => ({
  value: `op-${i}`,
  label: `Opção ${i + 1}`,
}))

/** Até 10 opções: `Select` do Radix. */
export const Short: Story = {
  args: { options: gender, onValueChange: () => {} },
  render: (args) => (
    <Field label="Gênero" required>
      <OptionsSelect {...args} />
    </Field>
  ),
}
/** Acima de 10: `Combobox` com busca. */
export const Long: Story = {
  args: { options: long, onValueChange: () => {} },
  render: (args) => (
    <Field label="Estado">
      <OptionsSelect {...args} />
    </Field>
  ),
}
export const WithValueAndError: Story = {
  args: { options: gender, value: 2, onValueChange: () => {} },
  render: (args) => (
    <Field label="Gênero" error="Escolha uma opção">
      <OptionsSelect {...args} />
    </Field>
  ),
}
export const Disabled: Story = {
  args: { options: gender, value: 1, disabled: true, onValueChange: () => {} },
  render: (args) => (
    <Field label="Gênero">
      <OptionsSelect {...args} />
    </Field>
  ),
}
