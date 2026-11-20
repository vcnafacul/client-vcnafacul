import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationControls,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination"

// Botões de verdade (teclado), páginas em `ghost` e a atual em `primary`.
const meta = {
  title: "Componentes/Pagination",
  component: PaginationControls,
  tags: ["autodocs"],
  args: { page: 1, totalPages: 26, onPageChange: () => {} },
} satisfies Meta<typeof PaginationControls>

export default meta
type Story = StoryObj<typeof meta>

function Controlada({ totalPages, inicial }: { totalPages: number; inicial: number }) {
  const [page, setPage] = useState(inicial)
  return <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
}

export const FirstPage: Story = { render: () => <Controlada totalPages={26} inicial={1} /> }
export const MiddlePage: Story = { render: () => <Controlada totalPages={26} inicial={12} /> }
export const FewPages: Story = { render: () => <Controlada totalPages={4} inicial={2} /> }
export const Parts: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}
