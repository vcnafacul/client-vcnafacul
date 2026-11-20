import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  DateRangeFields,
  DateRangePicker,
  type DateStringRange,
} from "./date-range-picker"

const meta = {
  title: "Componentes/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  args: { onChange: () => {}, "aria-label": "Período" },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="h-96 max-w-xs"><Story /></div>],
  render: function Render(args) {
    const [valor, setValor] = useState(args.value)
    return <DateRangePicker {...args} value={valor} onChange={setValor} />
  },
} satisfies Meta<typeof DateRangePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const WithRange: Story = {
  args: {
    value: {
      from: new Date("2026-11-03T12:00:00-03:00"),
      to: new Date("2026-11-07T12:00:00-03:00"),
    },
  },
}
export const Disabled: Story = { args: { disabled: true } }

// Filtro com `<input type="date">` nativo, usado pelas listagens da Dash V2.
export const NativeFields: Story = {
  render: function Render() {
    const [v, setV] = useState<DateStringRange>({ de: "2026-03-10", ate: "2026-03-20" })
    return <DateRangeFields label="Inicia em" value={v} onChange={setV} />
  },
}
export const NativeFieldsInverted: Story = {
  render: function Render() {
    const [v, setV] = useState<DateStringRange>({ de: "2026-03-20", ate: "2026-03-10" })
    return <DateRangeFields label="Inicia em" value={v} onChange={setV} />
  },
}
