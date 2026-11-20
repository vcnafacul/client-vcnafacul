import type { Meta, StoryObj } from "@storybook/react-vite"
import { Info } from "lucide-react"

import { Button } from "./button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

// Estrutura: DialogHeader e DialogFooter ficam fixos; o resto dos filhos (ou um DialogBody explícito) rola.
// Abaixo de 768 o Dialog é tela cheia, com os botões do rodapé empilhados (ação principal em cima).
const meta = {
  title: "Componentes/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg", "full"] } },
  args: { size: "md" },
  render: (args) => (
    <Dialog size={args.size}>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar prova</DialogTitle>
          <DialogDescription>Mude o nome e a data da prova.</DialogDescription>
        </DialogHeader>
        <p className="text-body">Conteúdo do corpo.</p>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Medium: Story = {}
export const Small: Story = { args: { size: "sm" } }
export const Large: Story = { args: { size: "lg" } }
export const Full: Story = { args: { size: "full" } }

export const WithBannerAndStatus: Story = {
  render: (args) => (
    <Dialog size={args.size}>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </DialogTrigger>
      <DialogContent
        banner={
          <div className="flex items-center gap-2 rounded-lg bg-info-muted p-3 text-body-sm">
            <Info className="size-4" /> 2 problemas impedem salvar
          </div>
        }
      >
        <DialogHeader>
          <DialogTitle>Registrar frequência</DialogTitle>
        </DialogHeader>
        <p className="text-body">Lista de estudantes.</p>
        <DialogFooter status="12 presentes · 3 ausentes">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const LongBodyScrolls: Story = {
  render: (args) => (
    <Dialog size={args.size}>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Termos de uso</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} className="text-body">Parágrafo {i + 1} do texto que só rola dentro do corpo.</p>
          ))}
        </DialogBody>
        <DialogFooter>
          <Button>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
