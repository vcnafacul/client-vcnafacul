import { describe, expect, it } from "vitest";
import { montarRelatorio, nomeDoArquivo, rotasDosLinks, VIEWPORTS } from "../../scripts/ds-screenshots-lib";

describe("ds-screenshots (tickets/059/01)", () => {
  it("lista só as rotas /dev/vitrine/:componente/:estado, sem repetir", () => {
    const rotas = rotasDosLinks([
      "/dev/vitrine",
      "/dev/vitrine/chamada/lista",
      "/dev/vitrine/chamada/lista",
      "http://x.test/dev/vitrine/anulacao/aviso",
      "/outra/coisa",
      "/dev/vitrine/so-componente",
    ]);
    expect(rotas.map((r) => r.caminho)).toEqual(["/dev/vitrine/chamada/lista", "/dev/vitrine/anulacao/aviso"]);
  });

  it("usa os três tamanhos decididos", () => {
    expect(VIEWPORTS.map((v) => v.nome)).toEqual(["390x844", "390x640", "1280x800"]);
  });

  it("monta o relatório com os pares e destaca Dialog sem ação visível", () => {
    const rota = { componente: "a", estado: "b", caminho: "/dev/vitrine/a/b" };
    const vp = VIEWPORTS[1];
    const html = montarRelatorio(
      [
        {
          rota,
          viewport: vp,
          antes: nomeDoArquivo(rota, vp, "antes"),
          depois: null,
          dialogos: [{ titulo: "Editar <prova>", acaoVisivel: false }],
        },
      ],
      { antes: "http://a", depois: "http://b" },
    );
    expect(html).toContain("a__b__390x640__antes.png");
    expect(html).toContain("sem captura");
    expect(html).toContain("NÃO visível");
    expect(html).toContain("Editar &lt;prova&gt;");
  });
});
