import type { Meta, StoryObj } from "@storybook/react-vite"

import { RadioGroup, RadioGroupItem } from "./radio-group"

const meta = {
  title: "Componentes/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: { defaultValue: "tarde", "aria-label": "Período" },
  argTypes: { disabled: { control: "boolean" } },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="manha" label="Manhã" />
      <RadioGroupItem value="tarde" label="Tarde" />
      <RadioGroupItem value="noite" label="Noite" />
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const NoSelection: Story = { args: { defaultValue: undefined } }
export const Disabled: Story = { args: { disabled: true } }
export const OneOptionDisabled: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="manha" label="Manhã" />
      <RadioGroupItem value="tarde" label="Tarde" />
      <RadioGroupItem value="noite" label="Noite (sem vaga)" disabled />
    </RadioGroup>
  ),
}
