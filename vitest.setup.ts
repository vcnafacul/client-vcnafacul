import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sem `globals: true`, o Testing Library não registra o cleanup automático e o
// DOM de um teste vaza para o seguinte — queries por `document.querySelector`
// passam a enxergar elementos do teste anterior.
afterEach(() => {
  cleanup();
});
