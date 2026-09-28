import { describe, expect, it } from "vitest";

/*
  ⚠️ O `mapBox` tem de carregar SOZINHO. Ele importava o `leaflet.markercluster`
  antes do `leaflet`, e o plugin (UMD) precisa do `L` global que o Leaflet cria:
  funcionava só porque outro arquivo carregava o Leaflet antes. Quando a ordem
  dos imports do PlatformRoutes mudou (tickets/022, card 10), o app inteiro
  ficou em branco com "L is not defined". Este teste importa o módulo num
  ambiente em que ninguém carregou o Leaflet antes.
*/
describe("mapBox — importação isolada", () => {
  it("carrega sem depender de outro módulo ter carregado o Leaflet", async () => {
    delete (globalThis as { L?: unknown }).L;
    await expect(import("./index")).resolves.toBeDefined();
  });
});
