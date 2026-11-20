import type { Meta, StoryObj } from "@storybook/react-vite"
import { Check, X } from "lucide-react"
import { useState } from "react"

import { SegmentedControl } from "./segmented-control"

const opcoes = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
]

const meta = {
  title: "Componentes/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  args: {
    "aria-label": "Período",
    options: opcoes,
    value: "semana",
    onValueChange: () => {},
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    fullWidth: { control: "boolean" },
  },
  render: function Render(args) {
    const [valor, setValor] = useState(args.value)
    return <SegmentedControl {...args} value={valor} onValueChange={setValor} />
  },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Small: Story = { args: { size: "sm" } }
export const FullWidth: Story = { args: { fullWidth: true } }
export const WithIcons: Story = {
  args: {
    "aria-label": "Presença",
    value: "presente",
    options: [
      { value: "presente", label: "Presente", icon: Check },
      { value: "ausente", label: "Ausente", icon: X },
    ],
  },
}
export const OptionDisabled: Story = {
  args: {
    options: [
      { value: "dia", label: "Dia" },
      { value: "semana", label: "Semana" },
      { value: "mes", label: "Mês", disabled: true },
    ],
  },
}
