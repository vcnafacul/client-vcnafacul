import type { Meta, StoryObj } from "@storybook/react-vite"
import { AlertTriangle } from "lucide-react"

import { StatusBadge, type StatusVariant } from "./status-badge"

// `dot` em tabelas e listas; `tint` sozinho e em páginas de detalhe. Status nunca é laranja.
const VARIANTES: [StatusVariant, string][] = [
  ["success", "Concluída"],
  ["warning", "Em andamento"],
  ["destructive", "Faltando questões"],
  ["info", "Agendada"],
  ["neutral", "Rascunho"],
]

const meta = {
  title: "Componentes/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  args: { variant: "success", look: "dot", children: "Concluída" },
  argTypes: {
    variant: { control: "select", options: VARIANTES.map(([v]) => v) },
    look: { control: "inline-radio", options: ["dot", "tint"] },
  },
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {}
export const Warning: Story = { args: { variant: "warning", children: "Em andamento" } }
export const Destructive: Story = { args: { variant: "destructive", children: "Faltando questões" } }
export const Info: Story = { args: { variant: "info", children: "Agendada" } }
export const Neutral: Story = { args: { variant: "neutral", children: "Rascunho" } }
export const Tint: Story = { args: { look: "tint" } }

export const AllDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTES.map(([v, rotulo]) => (
        <StatusBadge key={v} variant={v}>
          {rotulo}
        </StatusBadge>
      ))}
    </div>
  ),
}

export const AllTint: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {VARIANTES.map(([v, rotulo]) => (
        <StatusBadge key={v} variant={v} look="tint">
          {rotulo}
        </StatusBadge>
      ))}
    </div>
  ),
}

// D21: risco de evasão.
export const WithIconAndValue: Story = {
  args: { variant: "warning", look: "tint", icon: AlertTriangle, value: "32%", children: "Risco de evasão" },
}
