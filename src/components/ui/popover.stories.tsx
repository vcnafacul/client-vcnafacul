import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

const meta = {
  title: "Componentes/Popover",
  component: Popover,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="h-48"><Story /></div>],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Abrir</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-body-sm">Conteúdo de apoio ao lado do campo.</p>
      </PopoverContent>
    </Popover>
  ),
}
