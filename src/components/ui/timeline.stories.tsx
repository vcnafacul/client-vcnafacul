import type { Meta, StoryObj } from "@storybook/react-vite"
import { CheckCircle2, Pencil, Upload, XCircle } from "lucide-react"

import { Timeline, TimelineItem } from "./timeline"

// D18: histórico de eventos. Datas fictícias, no fuso de São Paulo.
const meta = {
  title: "Componentes/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  args: { state: "ready" },
  argTypes: { state: { control: "inline-radio", options: ["ready", "loading", "empty", "error"] } },
  render: (args) => (
    <Timeline {...args} className="max-w-form">
      <TimelineItem
        icon={Upload}
        variant="neutral"
        who="Ana"
        what="enviou a questão"
        when={new Date("2026-11-10T13:05:00Z")}
      />
      <TimelineItem
        icon={XCircle}
        variant="destructive"
        who="Bruno"
        what="rejeitou a questão"
        when={new Date("2026-11-11T18:20:00Z")}
        detail="A alternativa C está duplicada."
      />
      <TimelineItem
        icon={Pencil}
        variant="info"
        who="Ana"
        what="editou as alternativas"
        when={new Date("2026-11-12T12:00:00Z")}
      />
      <TimelineItem
        icon={CheckCircle2}
        variant="success"
        who="Carla"
        what="aprovou a questão"
        when={new Date("2026-11-12T17:30:00Z")}
      />
    </Timeline>
  ),
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithAction: Story = {
  render: () => (
    <Timeline className="max-w-form">
      <TimelineItem
        icon={XCircle}
        variant="destructive"
        who="Bruno"
        what="rejeitou a questão"
        when={new Date("2026-11-11T18:20:00Z")}
        detail="A alternativa C está duplicada."
        action={{ label: "Corrigir questão", onClick: () => {} }}
      />
      <TimelineItem
        icon={Upload}
        variant="neutral"
        who="Ana"
        what="enviou a questão"
        when={new Date("2026-11-10T13:05:00Z")}
      />
    </Timeline>
  ),
}
export const Loading: Story = { args: { state: "loading" } }
export const Empty: Story = { args: { state: "empty", empty: { title: "Nenhum evento ainda", hint: "As mudanças na questão aparecem aqui." } } }
export const Error: Story = { args: { state: "error", onRetry: () => {} } }
