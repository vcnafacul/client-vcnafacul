import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  EventoDaTimeline,
  TipoDeEvento,
} from "@/dtos/content/timelineDto";
import { AbaHistorico } from "./AbaHistorico";

const evento = (
  tipo: TipoDeEvento,
  over: Partial<EventoDaTimeline> = {},
): EventoDaTimeline => ({
  tipo,
  em: "2026-09-01T12:00:00.000Z",
  porId: "u-ana",
  por: "Ana Souza",
  ...over,
});

describe("AbaHistorico", () => {
  it("renderiza os nove tipos com nome e frase; 'outro' mostra a mensagem crua", () => {
    const eventos: EventoDaTimeline[] = [
      evento("criada", { por: "Carla Mendes" }),
      evento("enviada", {
        material: {
          fileContentId: "f1",
          tipo: "documento",
          originalName: "v1.docx",
        },
      }),
      evento("aprovada", { por: "Bruno Costa" }),
      evento("rejeitada", {
        por: "Bruno Costa",
        detalhe: "Faltou a bibliografia",
      }),
      evento("resetada", { por: "Bruno Costa" }),
      evento("proposta_enviada", {
        por: "Dani Reis",
        detalhe: "Troquei por vídeo",
        material: {
          fileContentId: "f2",
          tipo: "video",
          videoId: "dQw4w9WgXcQ",
        },
      }),
      evento("proposta_aprovada", { por: "Eva Lima" }),
      evento("proposta_recusada", { por: "Eva Lima" }),
      evento("material_substituido", {
        por: "Dani Reis",
        material: {
          fileContentId: "f2",
          tipo: "video",
          videoId: "dQw4w9WgXcQ",
        },
      }),
      evento("outro", { detalhe: "mensagem estranha" }),
    ];
    render(
      <AbaHistorico
        eventos={eventos}
        erro={null}
        onTentarDeNovo={vi.fn()}
        onVerMaterial={vi.fn()}
      />,
    );

    const itens = within(
      screen.getByRole("list", { name: "Histórico da demanda" }),
    ).getAllByRole("listitem");
    expect(itens).toHaveLength(10);
    expect(itens[0]).toHaveTextContent("Carla Mendes criou a demanda");
    expect(itens[1]).toHaveTextContent(
      "Ana Souza enviou o material (documento)",
    );
    expect(itens[2]).toHaveTextContent("Bruno Costa aprovou a demanda");
    expect(itens[3]).toHaveTextContent("rejeitou a demanda");
    expect(itens[3]).toHaveTextContent("Faltou a bibliografia");
    expect(itens[4]).toHaveTextContent(
      "devolveu a demanda para a fila de envio",
    );
    expect(itens[5]).toHaveTextContent("propôs um ajuste (vídeo)");
    expect(itens[5]).toHaveTextContent("Troquei por vídeo");
    expect(itens[6]).toHaveTextContent("aprovou a proposta de ajuste");
    expect(itens[7]).toHaveTextContent("recusou a proposta de ajuste");
    expect(itens[8]).toHaveTextContent(
      "teve o material substituído pelo da proposta (vídeo)",
    );
    expect(itens[9]).toHaveTextContent("registrou uma alteração");
    expect(itens[9]).toHaveTextContent("mensagem estranha");
    expect(itens[0]).toHaveTextContent("01/09/2026");
  });

  it("'Ver documento' / 'Ver vídeo' só nos eventos com material e devolve o material", () => {
    const onVerMaterial = vi.fn();
    render(
      <AbaHistorico
        eventos={[
          evento("criada"),
          evento("enviada", {
            material: { fileContentId: "f1", tipo: "documento" },
          }),
          evento("material_substituido", {
            material: { fileContentId: "f2", tipo: "video", videoId: "x" },
          }),
        ]}
        erro={null}
        onTentarDeNovo={vi.fn()}
        onVerMaterial={onVerMaterial}
      />,
    );
    expect(screen.getAllByRole("button", { name: /^Ver / })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Ver vídeo" }));
    expect(onVerMaterial).toHaveBeenCalledWith({
      fileContentId: "f2",
      tipo: "video",
      videoId: "x",
    });
  });

  it("usuário que não existe mais (por === porId) aparece como 'usuário removido'", () => {
    render(
      <AbaHistorico
        eventos={[evento("aprovada", { por: "u-sumido", porId: "u-sumido" })]}
        erro={null}
        onTentarDeNovo={vi.fn()}
        onVerMaterial={vi.fn()}
      />,
    );
    expect(screen.getByText("usuário removido")).toBeInTheDocument();
  });

  it("erro mostra a mensagem e 'Tentar de novo' chama o retry", () => {
    const onTentarDeNovo = vi.fn();
    render(
      <AbaHistorico
        eventos={null}
        erro="ms fora"
        onTentarDeNovo={onTentarDeNovo}
        onVerMaterial={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar o histórico. ms fora",
    );
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(onTentarDeNovo).toHaveBeenCalledTimes(1);
  });

  it("carregando mostra esqueleto; lista vazia mostra aviso", () => {
    const { rerender } = render(
      <AbaHistorico
        eventos={null}
        erro={null}
        onTentarDeNovo={vi.fn()}
        onVerMaterial={vi.fn()}
      />,
    );
    expect(document.querySelector("[aria-busy]")).not.toBeNull();
    rerender(
      <AbaHistorico
        eventos={[]}
        erro={null}
        onTentarDeNovo={vi.fn()}
        onVerMaterial={vi.fn()}
      />,
    );
    expect(screen.getByText("Nada registrado ainda.")).toBeInTheDocument();
  });
});
