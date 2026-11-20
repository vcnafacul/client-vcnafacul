import type { Meta, StoryObj } from "@storybook/react-vite"

import { Progress } from "./progress"

const meta = {
  title: "Componentes/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: { value: 40, "aria-label": "Envio do arquivo", className: "w-64" },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Complete: Story = { args: { value: 100 } }
