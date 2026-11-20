import type { Meta, StoryObj } from "@storybook/react-vite"
import { Copy, Eye, Search } from "lucide-react"

import { Button } from "./button"
import { Input } from "./input"

const meta = {
  title: "Componentes/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "Ex.: ENEM 2025", "aria-label": "Nome da prova" },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: "ENEM 2025" } }
export const Invalid: Story = { args: { defaultValue: "20255", "aria-invalid": true } }
export const Disabled: Story = { args: { disabled: true, defaultValue: "ENEM-2019-A" } }
export const WithLeadingIcon: Story = {
  args: { leading: <Search aria-hidden="true" />, placeholder: "Buscar prova…" },
}
export const WithTrailingIcon: Story = {
  args: { type: "password", defaultValue: "12345678", trailing: <Eye aria-hidden="true" /> },
}
export const WithTrailingButton: Story = {
  args: {
    defaultValue: "ana@exemplo.com",
    trailing: (
      <Button size="icon" variant="ghost" aria-label="Copiar e-mail" className="h-7 w-7 sm:h-7 sm:w-7">
        <Copy aria-hidden="true" />
      </Button>
    ),
  },
}
export const WithSuffix: Story = {
  args: { type: "number", inputMode: "numeric", defaultValue: "25", suffix: "% de faltas" },
}
