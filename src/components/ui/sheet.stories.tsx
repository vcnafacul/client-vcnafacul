import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet"

const meta = {
  title: "Componentes/Sheet",
  component: Sheet,
  tags: ["autodocs"],
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

function Exemplo({ side }: { side: "right" | "left" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>{side === "right" ? "Detalhes da inscrição" : "Menu"}</SheetTitle>
          <SheetDescription>{side === "right" ? "Dados de quem se inscreveu." : "Navegação do painel."}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

// Direita: só para detalhes (filtros ficam na página, D22). Esquerda: o menu no celular.
export const Right: Story = { render: () => <Exemplo side="right" /> }
export const Left: Story = { render: () => <Exemplo side="left" /> }
