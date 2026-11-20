import type { Meta, StoryObj } from "@storybook/react-vite"

import { Skeleton, TableSkeleton } from "./skeleton"

const meta = {
  title: "Componentes/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: { className: "h-4 w-64" },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const TableRows: Story = {
  render: () => (
    <table className="w-full table-fixed">
      <tbody>
        <TableSkeleton columns={4} rows={5} />
      </tbody>
    </table>
  ),
}
export const Cards: Story = {
  render: () => (
    <div className="max-w-sm rounded-lg border">
      <TableSkeleton layout="cards" rows={4} />
    </div>
  ),
}
