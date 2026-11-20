import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Combobox } from "./combobox"

const opcoes = [
  { value: "sp", label: "São Paulo" },
  { value: "rj", label: "Rio de Janeiro" },
  { value: "mg", label: "Minas Gerais" },
  { value: "ba", label: "Bahia" },
  { value: "pr", label: "Paraná" },
]

const meta = {
  title: "Componentes/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  args: {
    options: opcoes,
    onValueChange: () => {},
    "aria-label": "Estado",
    placeholder: "Selecionar estado",
  },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="h-72 max-w-sm"><Story /></div>],
  render: function Render(args) {
    const [valor, setValor] = useState(args.value)
    return <Combobox {...args} value={valor} onValueChange={setValor} />
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { value: "mg" } }
export const Invalid: Story = { args: { "aria-invalid": true } }
export const Disabled: Story = { args: { disabled: true, value: "ba" } }
export const Open: Story = { args: { defaultOpen: true, value: "rj" } }
