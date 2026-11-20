import type { Meta, StoryObj } from "@storybook/react-vite"

import { Spinner } from "./spinner"

const meta = {
  title: "Componentes/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  args: { size: "inline" },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Inline: Story = {}
export const Page: Story = { args: { size: "page" } }
export const Decorative: Story = { args: { size: "button", decorative: true } }
