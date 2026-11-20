import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

const meta = {
  title: "Componentes/Select",
  component: Select,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="h-56 max-w-sm"><Story /></div>],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const itens = (
  <SelectContent>
    <SelectItem value="linguagens">Linguagens</SelectItem>
    <SelectItem value="matematica">Matemática</SelectItem>
    <SelectItem value="natureza">Natureza</SelectItem>
    <SelectItem value="humanas">Humanas</SelectItem>
  </SelectContent>
)

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Frente">
        <SelectValue placeholder="Selecionar frente" />
      </SelectTrigger>
      {itens}
    </Select>
  ),
}

export const WithValue: Story = {
  render: (args) => (
    <Select {...args} defaultValue="matematica">
      <SelectTrigger aria-label="Frente">
        <SelectValue />
      </SelectTrigger>
      {itens}
    </Select>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Frente" aria-invalid>
        <SelectValue placeholder="Selecionar frente" />
      </SelectTrigger>
      {itens}
    </Select>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <Select {...args} disabled defaultValue="humanas">
      <SelectTrigger aria-label="Frente">
        <SelectValue />
      </SelectTrigger>
      {itens}
    </Select>
  ),
}

// Lista aberta: o item selecionado leva o check.
export const Open: Story = {
  render: (args) => (
    <Select {...args} defaultOpen defaultValue="matematica">
      <SelectTrigger aria-label="Frente">
        <SelectValue />
      </SelectTrigger>
      {itens}
    </Select>
  ),
}
