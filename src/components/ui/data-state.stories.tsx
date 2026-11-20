import type { Meta, StoryObj } from "@storybook/react-vite"
import { SearchX } from "lucide-react"

import { Button } from "./button"
import { EmptyState, ErrorState } from "./data-state"

// Os estados vazio e de erro de DataTable, List e Timeline.
const meta = {
  title: "Componentes/DataState",
  component: EmptyState,
  tags: ["autodocs"],
  args: { title: "Nenhuma prova cadastrada", hint: "As provas que você criar aparecem aqui." },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const EmptyWithAction: Story = {
  args: {
    icon: SearchX,
    title: "Nenhuma prova encontrada",
    hint: "Tente outros filtros.",
    action: <Button variant="outline">Limpar filtros</Button>,
  },
}
export const Error: Story = {
  render: () => <ErrorState onRetry={() => {}} />,
}
export const ErrorWithoutRetry: Story = {
  render: () => (
    <ErrorState
      title="Não foi possível carregar as provas."
      message="Atualize a página daqui a pouco."
    />
  ),
}
