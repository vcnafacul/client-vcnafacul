import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { DatePicker } from "./date-picker"

const meta = {
  title: "Componentes/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  args: { onChange: () => {}, "aria-label": "Data da prova" },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="h-96 max-w-xs"><Story /></div>],
  render: function Render(args) {
    const [valor, setValor] = useState(args.value)
    return <DatePicker {...args} value={valor} onChange={setValor} />
  },
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const WithValue: Story = { args: { value: new Date("2026-11-12T12:00:00-03:00") } }
export const BirthDate: Story = {
  args: {
    value: new Date("2000-05-10T12:00:00-03:00"),
    captionLayout: "dropdown",
    startMonth: new Date(1900, 0),
    endMonth: new Date(2026, 11),
    "aria-label": "Data de nascimento",
  },
}
export const Invalid: Story = { args: { "aria-invalid": true } }
export const Disabled: Story = { args: { disabled: true } }
