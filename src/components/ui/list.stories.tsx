import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Users } from "lucide-react"

import { Button } from "./button"
import { List, ListItem } from "./list"
import { SegmentedControl } from "./segmented-control"
import { StatusBadge } from "./status-badge"

// D20: lista sem colunas, ordenação nem seleção. Com isso tudo, é DataTable.
const meta = {
  title: "Componentes/List",
  component: List,
  tags: ["autodocs"],
  args: { state: "ready" },
  argTypes: { state: { control: "inline-radio", options: ["ready", "loading", "empty", "error"] } },
  render: (args) => (
    <List {...args} className="max-w-form rounded-lg border">
      <ListItem
        title="Chamada de 10/11/2026"
        meta={["Turma A", "28 presentes", "4 ausentes"]}
        trailing={<Button variant="outline" size="sm">Ver chamada</Button>}
      />
      <ListItem
        title="Chamada de 03/11/2026"
        meta={["Turma A", "30 presentes", "2 ausentes"]}
        badges={<StatusBadge variant="warning">Pendente</StatusBadge>}
        trailing={<Button variant="outline" size="sm">Ver chamada</Button>}
      />
    </List>
  ),
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { state: "loading" } }
export const Empty: Story = {
  args: {
    state: "empty",
    empty: { icon: Users, title: "Nenhuma chamada registrada", hint: "As chamadas da turma aparecem aqui." },
  },
}
export const Error: Story = { args: { state: "error", onRetry: () => {} } }

function Presenca() {
  const [valores, setValores] = useState<Record<string, string>>({ ana: "presente", bruno: "ausente" })
  const alunos = [
    { id: "ana", nome: "Ana Souza", meta: ["2 faltas no mês"] },
    { id: "bruno", nome: "Bruno Lima", meta: ["5 faltas no mês"] },
  ]
  return (
    <List className="max-w-form rounded-lg border">
      {alunos.map((a) => (
        <ListItem
          key={a.id}
          title={a.nome}
          meta={a.meta}
          trailing={
            <SegmentedControl
              size="sm"
              aria-label={`Presença de ${a.nome}`}
              value={valores[a.id]}
              onValueChange={(v) => setValores((x) => ({ ...x, [a.id]: v }))}
              options={[
                { value: "presente", label: "Presente" },
                { value: "ausente", label: "Ausente" },
              ]}
            />
          }
        />
      ))}
    </List>
  )
}

export const WithSegmentedControl: Story = { render: () => <Presenca /> }
