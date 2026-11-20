import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

// Peças de baixo nível, para tabelas estáticas simples. Lista com ordenação, seleção ou paginação é DataTable.
const LINHAS = [
  { materia: "Matemática", acertos: 32, total: 45 },
  { materia: "Linguagens", acertos: 38, total: 45 },
  { materia: "Ciências da natureza", acertos: 27, total: 45 },
]

const meta = {
  title: "Componentes/Table",
  component: Table,
  tags: ["autodocs"],
  render: (args) => (
    <Table {...args}>
      <TableCaption>Acertos por área no Simulado Nacional 3</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Área</TableHead>
          <TableHead className="text-right">Acertos</TableHead>
          <TableHead className="text-right">Questões</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {LINHAS.map((l) => (
          <TableRow key={l.materia}>
            <TableCell>{l.materia}</TableCell>
            <TableCell className="text-right tabular-nums">{l.acertos}</TableCell>
            <TableCell className="text-right tabular-nums">{l.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const SelectedRow: Story = {
  render: () => (
    <Table>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell>Linha selecionada</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Outra linha</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Área</TableHead>
          <TableHead className="text-right">Acertos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {LINHAS.map((l) => (
          <TableRow key={l.materia}>
            <TableCell>{l.materia}</TableCell>
            <TableCell className="text-right tabular-nums">{l.acertos}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell className="text-right tabular-nums">97</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}
