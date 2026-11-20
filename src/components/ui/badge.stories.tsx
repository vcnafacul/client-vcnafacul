import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "./badge"

// Para status (Concluída, Em andamento…), use o StatusBadge.
const meta = {
  title: "Componentes/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Matemática" },
  argTypes: { variant: { control: "inline-radio", options: ["default", "secondary", "outline"] } },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { variant: "default" } }
export const Secondary: Story = { args: { variant: "secondary" } }
export const Outline: Story = { args: { variant: "outline" } }
