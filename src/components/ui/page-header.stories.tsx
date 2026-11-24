import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { Button } from "./button";
import { PageHeader, PageShell } from "./page-header";

const meta: Meta<typeof PageHeader> = {
  title: "Componentes/PageHeader",
  component: PageHeader,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

export const SoTitulo: Story = {
  render: () => (
    <PageShell>
      <PageHeader title="Minha conta" />
    </PageShell>
  ),
};

export const ComAcoes: Story = {
  render: () => (
    <PageShell>
      <PageHeader
        title="Períodos Letivos"
        subtitle="3 períodos letivos"
        actions={
          <>
            <Button variant="outline">
              <TriangleAlert aria-hidden="true" />
              Alerta de evasão
            </Button>
            <Button variant="cta">Novo Período Letivo</Button>
          </>
        }
      />
    </PageShell>
  ),
};

export const ComVoltar: Story = {
  render: () => (
    <PageShell>
      <PageHeader
        title="Turma A"
        subtitle="Período 2026"
        backButton={
          <Button variant="ghost" size="icon" aria-label="Voltar">
            <ArrowLeft aria-hidden="true" />
          </Button>
        }
      />
    </PageShell>
  ),
};

export const ComFiltros: Story = {
  render: () => (
    <PageShell>
      <PageHeader title="Inscrições" subtitle="42 registros">
        <div className="flex gap-2 px-4 py-3 text-body text-muted-foreground">(linha de filtros)</div>
      </PageHeader>
    </PageShell>
  ),
};
