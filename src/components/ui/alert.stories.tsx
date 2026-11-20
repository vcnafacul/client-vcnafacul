import type { Meta, StoryObj } from "@storybook/react-vite"

import { Alert } from "./alert"
import { Button } from "./button"

const meta = {
  title: "Componentes/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    title: "Não foi possível salvar a prova.",
    children: "Verifique sua conexão e tente de novo.",
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Destructive: Story = { args: { variant: "destructive" } }
export const Warning: Story = {
  args: { variant: "warning", title: "Há alterações não salvas.", children: undefined },
}
export const Success: Story = {
  args: { variant: "success", title: "Prova salva.", children: undefined },
}
export const Info: Story = { args: { variant: "info", title: "Inscrições abertas até sexta." } }
export const WithAction: Story = {
  args: {
    variant: "destructive",
    action: (
      <Button type="button" variant="outline" size="sm">
        Tentar de novo
      </Button>
    ),
  },
}
