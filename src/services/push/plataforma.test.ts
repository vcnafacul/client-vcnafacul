import { describe, expect, it } from "vitest";
import { ehIOS, iosAntigo, plataforma, versaoDoIOS } from "./plataforma";

const UA = {
  iphone163:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
  iphone17:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  ipadOS:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36",
  macChrome:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
};
const amb = (userAgent: string, maxTouchPoints = 0) => ({
  userAgent,
  maxTouchPoints,
  standalone: false,
});

describe("plataforma", () => {
  it("iPhone é iOS", () => {
    expect(ehIOS(amb(UA.iphone17))).toBe(true);
  });

  it("⚠️ iPadOS se diz Macintosh: é iOS quando tem tela de toque", () => {
    expect(ehIOS(amb(UA.ipadOS, 5))).toBe(true);
    expect(ehIOS(amb(UA.ipadOS, 0))).toBe(false);
  });

  it("versão do iOS pelo UA (OS 16_3 e Version/17.4)", () => {
    expect(versaoDoIOS(UA.iphone163)).toEqual([16, 3]);
    expect(versaoDoIOS(UA.ipadOS)).toEqual([17, 4]);
  });

  it("antes do 16.4 é antigo; 16.4+ não", () => {
    expect(iosAntigo([16, 3])).toBe(true);
    expect(iosAntigo([15, 9])).toBe(true);
    expect(iosAntigo([16, 4])).toBe(false);
    expect(iosAntigo([17, 0])).toBe(false);
    expect(iosAntigo(null)).toBe(false);
  });

  it("android / desktop / ios", () => {
    expect(plataforma(amb(UA.android))).toBe("android");
    expect(plataforma(amb(UA.macChrome))).toBe("desktop");
    expect(plataforma(amb(UA.iphone17))).toBe("ios");
    expect(plataforma(amb("Bot/1.0"))).toBe("other");
  });
});
