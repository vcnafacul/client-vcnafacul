import type { Meta, StoryObj } from "@storybook/react-vite"

import { Checkbox } from "./checkbox"

const meta = {
  title: "Componentes/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { label: "Só provas oficiais" },
  argTypes: { disabled: { control: "boolean" }, checked: { control: "select", options: [true, false, "indeterminate"] } },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Indeterminate: Story = { args: { checked: "indeterminate", label: "2 selecionadas" } }
export const Disabled: Story = { args: { disabled: true } }
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } }
export const Invalid: Story = { args: { "aria-invalid": true, label: "Li e aceito os termos" } }
