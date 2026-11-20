import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

// Borda e nenhuma sombra: sombra é só do que flutua (tickets/059 §3).
const meta = {
  title: "Componentes/Card",
  component: Card,
  tags: ["autodocs"],
  render: (args) => (
    <Card {...args} className="max-w-form">
      <CardHeader>
        <CardTitle>Turma A · 2026</CardTitle>
        <CardDescription>32 estudantes matriculados</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body">A próxima chamada é na segunda-feira, às 19h.</p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline">Ver turma</Button>
        <Button>Registrar chamada</Button>
      </CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const ContentOnly: Story = {
  render: () => (
    <Card className="max-w-form">
      <CardContent className="pt-4">
        <p className="text-body">Um bloco simples, sem cabeçalho.</p>
      </CardContent>
    </Card>
  ),
}
