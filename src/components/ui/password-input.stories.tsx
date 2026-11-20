import type { Meta, StoryObj } from "@storybook/react-vite"

import { Field } from "./field"
import { PasswordInput } from "./password-input"

const meta = {
  title: "Componentes/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { autoComplete: "current-password" },
  render: (args) => (
    <Field label="Senha" required>
      <PasswordInput {...args} />
    </Field>
  ),
}
export const Visible: Story = {
  args: { initiallyVisible: true, defaultValue: "Senha#2025", autoComplete: "new-password" },
  render: (args) => (
    <Field label="Nova senha">
      <PasswordInput {...args} />
    </Field>
  ),
}
export const Invalid: Story = {
  args: { defaultValue: "123", autoComplete: "new-password" },
  render: (args) => (
    <Field label="Nova senha" error="Senha muito curta, deve ter no mínimo 8 caracteres">
      <PasswordInput {...args} />
    </Field>
  ),
}
