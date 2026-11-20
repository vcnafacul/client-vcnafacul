import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "./calendar"

const meta = {
  title: "Componentes/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  args: { defaultMonth: new Date(2026, 10, 1) },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { today: new Date(2026, 10, 19) } }

export const SingleSelected: Story = {
  render: function Render(args) {
    const [dia, setDia] = useState<Date | undefined>(new Date(2026, 10, 12))
    return <Calendar {...args} mode="single" selected={dia} onSelect={setDia} />
  },
}

export const Range: Story = {
  render: function Render(args) {
    const [r, setR] = useState<DateRange | undefined>({
      from: new Date(2026, 10, 3),
      to: new Date(2026, 10, 7),
    })
    return <Calendar {...args} mode="range" selected={r} onSelect={setR} />
  },
}

export const WithDisabledDays: Story = {
  args: { disabled: { before: new Date(2026, 10, 10) } },
}
