import type { Meta, StoryObj } from "@storybook/react-vite"

import { ScrollArea } from "./scroll-area"

const NOMES = Array.from({ length: 30 }, (_, i) => `Estudante ${i + 1}`)

const meta = {
  title: "Componentes/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  render: (args) => (
    <ScrollArea {...args} className="h-60 w-64 rounded-md border">
      <ul className="divide-y">
        {NOMES.map((nome) => (
          <li key={nome} className="px-3 py-2 text-body">
            {nome}
          </li>
        ))}
      </ul>
    </ScrollArea>
  ),
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
