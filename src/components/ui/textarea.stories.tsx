import type { Meta, StoryObj } from "@storybook/react-vite"

import { Textarea } from "./textarea"

const meta = {
  title: "Componentes/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { placeholder: "Escreva aqui…", "aria-label": "Observações" },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="max-w-sm"><Story /></div>],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: "Prova aplicada em duas etapas." } }
export const Invalid: Story = { args: { "aria-invalid": true } }
export const Disabled: Story = { args: { disabled: true, defaultValue: "Somente leitura." } }
export const WithSuffix: Story = { args: { suffix: "máx. 500" } }
