import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";

const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("react-toastify", () => ({ toast }));

import { useConversaDoLinkNaInbox } from "./useConversaDoLinkNaInbox";

const conv = (id: string) => ({ id }) as ConversationDoc;
const lista = (carregado: boolean, ids: string[]) => ({
  carregado,
  convs: ids.map(conv),
  setSelectedId: vi.fn(),
});

function usar(props: Parameters<typeof useConversaDoLinkNaInbox>[0]) {
  let busca = "";
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={["/dashboard/suporte?conversa=c9"]}>
      {children}
    </MemoryRouter>
  );
  const r = renderHook(
    (p: typeof props) => {
      useConversaDoLinkNaInbox(p);
      busca = useLocation().search;
    },
    { wrapper, initialProps: props },
  );
  return { ...r, busca: () => busca };
}

beforeEach(() => vi.clearAllMocks());

describe("useConversaDoLinkNaInbox", () => {
  it("nas ativas: seleciona, mostra a aba e limpa o endereço", () => {
    const ativas = lista(true, ["c1", "c9"]);
    const mostrarAba = vi.fn();
    const { busca } = usar({
      ativas,
      arquivadas: lista(false, []),
      arquivadasLigadas: false,
      ligarArquivadas: vi.fn(),
      mostrarAba,
    });
    expect(ativas.setSelectedId).toHaveBeenCalledWith("c9");
    expect(mostrarAba).toHaveBeenCalledWith("active");
    expect(busca()).toBe("");
  });

  it("espera a lista carregar antes de decidir", () => {
    const ativas = lista(false, []);
    const { busca } = usar({
      ativas,
      arquivadas: lista(false, []),
      arquivadasLigadas: false,
      ligarArquivadas: vi.fn(),
      mostrarAba: vi.fn(),
    });
    expect(ativas.setSelectedId).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
    expect(busca()).toBe("?conversa=c9");
  });

  it("não está nas ativas: liga as arquivadas e procura lá", () => {
    const ligarArquivadas = vi.fn();
    const mostrarAba = vi.fn();
    const arquivadas = lista(true, ["c9"]);
    const base = {
      ativas: lista(true, ["c1"]),
      arquivadas: lista(false, []),
      arquivadasLigadas: false,
      ligarArquivadas,
      mostrarAba,
    };
    const { rerender } = usar(base);
    expect(ligarArquivadas).toHaveBeenCalled();

    rerender({ ...base, arquivadas, arquivadasLigadas: true });
    expect(arquivadas.setSelectedId).toHaveBeenCalledWith("c9");
    expect(mostrarAba).toHaveBeenCalledWith("archived");
  });

  it("fora do alcance (outro cursinho, expirada): aviso e nada selecionado", () => {
    const ativas = lista(true, ["c1"]);
    const arquivadas = lista(true, ["c2"]);
    const { busca } = usar({
      ativas,
      arquivadas,
      arquivadasLigadas: true,
      ligarArquivadas: vi.fn(),
      mostrarAba: vi.fn(),
    });
    expect(toast.info).toHaveBeenCalledWith("Conversa não encontrada.");
    expect(ativas.setSelectedId).not.toHaveBeenCalled();
    expect(arquivadas.setSelectedId).not.toHaveBeenCalled();
    expect(busca()).toBe("");
  });
});
