import type { Meta, StoryObj } from "@storybook/react-vite"

import { toast } from "@/lib/toast"

import { Button } from "./button"
import { Toaster } from "./toast"

const meta = {
  title: "Componentes/Toast",
  component: Toaster,
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

// Sucesso e info somem em 5 s; aviso e erro ficam até fechar.
export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toaster />
      <Button type="button" variant="outline" onClick={() => toast.success("Prova salva.")}>
        Sucesso
      </Button>
      <Button type="button" variant="outline" onClick={() => toast.info("Simulado agendado.")}>
        Info
      </Button>
      <Button type="button" variant="outline" onClick={() => toast.warning("Conexão instável.")}>
        Aviso
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => toast.error("Não foi possível enviar. Tente de novo.")}
      >
        Erro
      </Button>
    </div>
  ),
}
