import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const meta = {
  title: "Componentes/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="h-56"><Story /></div>],
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ações</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Prova</DropdownMenuLabel>
        <DropdownMenuItem>
          <Pencil /> Editar <DropdownMenuShortcut>E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 /> Excluir prova
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
