import { composeStories } from "@storybook/react";
import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { beforeAll, describe, expect, it } from "vitest";

// Toda história do catálogo precisa renderizar sem erro (tickets/059 §5.1).
const modulos = import.meta.glob("./*.stories.tsx", { eager: true }) as Record<
  string,
  Parameters<typeof composeStories>[0]
>;

// cmdk e o Radix Select abertos medem e rolam elementos; o jsdom não tem nada disso.
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // O Sidebar decide mobile/desktop por matchMedia.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  Element.prototype.scrollIntoView ??= () => {};
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
});

describe("stories de components/ui", () => {
  it("há histórias para o catálogo", () => {
    expect(Object.keys(modulos).length).toBeGreaterThan(0);
  });

  for (const [arquivo, modulo] of Object.entries(modulos)) {
    describe(arquivo, () => {
      const historias = composeStories(modulo);
      for (const [nome, historia] of Object.entries(historias)) {
        it(`${nome} renderiza`, () => {
          const Story = historia as ComponentType;
          expect(() => render(<Story />)).not.toThrow();
        });
      }
    });
  }
});
