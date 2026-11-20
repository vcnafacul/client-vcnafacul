import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pencil, Plus } from "lucide-react"

import { Button } from "./button"

// No máximo um `cta` por tela (tickets/059 §3).
const meta = {
  title: "Componentes/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Salvar rascunho" },
  argTypes: {
    variant: {
      control: "select",
      options: ["cta", "primary", "secondary", "outline", "ghost", "destructive", "link"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Cta: Story = { args: { variant: "cta", children: "Publicar prova" } }
export const Primary: Story = { args: { variant: "primary" } }
export const Secondary: Story = { args: { variant: "secondary" } }
export const Outline: Story = { args: { variant: "outline" } }
export const Ghost: Story = { args: { variant: "ghost" } }
export const Destructive: Story = { args: { variant: "destructive", children: "Excluir prova" } }
export const Link: Story = { args: { variant: "link", children: "Ver detalhes" } }

export const Small: Story = { args: { size: "sm", children: "Pequeno" } }
export const Large: Story = { args: { size: "lg", children: "Grande" } }

export const WithIcon: Story = {
  args: { variant: "cta" },
  render: (args) => (
    <Button {...args}>
      <Plus aria-hidden="true" />
      Nova prova
    </Button>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <Button size="icon" variant="outline" aria-label="Editar">
      <Pencil aria-hidden="true" />
    </Button>
  ),
}

export const Loading: Story = { args: { loading: true, children: "Salvando" } }
export const Disabled: Story = { args: { disabled: true } }

export const AsChild: Story = {
  render: (args) => (
    <Button {...args} asChild variant="outline">
      <a href="#destino">Link com cara de botão</a>
    </Button>
  ),
}
