import type { Meta, StoryObj } from "@storybook/react-vite"
import { HelpCircle } from "lucide-react"

import { Button } from "./button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

// Abre com hover, foco e toque. Só texto curto; o que for essencial não fica só no tooltip.
const meta = {
  title: "Componentes/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [(Story) => <TooltipProvider><div className="p-12"><Story /></div></TooltipProvider>],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" aria-label="Ajuda">
          <HelpCircle />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Faltas contam a partir da matrícula.</TooltipContent>
    </Tooltip>
  ),
}
