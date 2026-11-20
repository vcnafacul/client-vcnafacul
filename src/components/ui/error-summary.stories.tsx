import type { Meta, StoryObj } from "@storybook/react-vite"

import { ErrorSummary } from "./error-summary"

const meta = {
  title: "Componentes/ErrorSummary",
  component: ErrorSummary,
  tags: ["autodocs"],
  args: {
    items: [
      { message: "Informe o enunciado.", where: "aba Enunciado", onGoTo: () => {} },
      { message: "Marque a alternativa correta.", where: "aba Alternativas", onGoTo: () => {} },
    ],
  },
} satisfies Meta<typeof ErrorSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const SingleItem: Story = {
  args: { items: [{ message: "Informe o enunciado.", where: "aba Enunciado", onGoTo: () => {} }] },
}
