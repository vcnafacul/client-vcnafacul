import type { PlataformaDoAparelho } from "./api";

/** Menor versão do iOS com Web Push (e só com o site instalado). */
export const IOS_MINIMO: [number, number] = [16, 4];

export type Ambiente = {
  userAgent: string;
  maxTouchPoints: number;
  standalone: boolean;
};

/**
 * iPhone/iPod/iPad — ⚠️ inclusive o iPadOS, que se apresenta como
 * `Macintosh`: a diferença é ter tela de toque.
 */
export function ehIOS({ userAgent, maxTouchPoints }: Ambiente): boolean {
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  );
}

/** `[16, 4]` para `… OS 16_4 …` / `Version/16.4`; `null` se não achar. */
export function versaoDoIOS(userAgent: string): [number, number] | null {
  const m =
    /OS (\d+)[._](\d+)/.exec(userAgent) ??
    /Version\/(\d+)\.(\d+)/.exec(userAgent);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export function iosAntigo(versao: [number, number] | null): boolean {
  if (!versao) return false;
  const [maior, menor] = versao;
  return (
    maior < IOS_MINIMO[0] || (maior === IOS_MINIMO[0] && menor < IOS_MINIMO[1])
  );
}

export function plataforma(ambiente: Ambiente): PlataformaDoAparelho {
  if (ehIOS(ambiente)) return "ios";
  if (/Android/i.test(ambiente.userAgent)) return "android";
  if (/Windows|Macintosh|Linux|CrOS/.test(ambiente.userAgent)) return "desktop";
  return "other";
}

export function ambienteAtual(): Ambiente {
  return {
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    standalone:
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
  };
}
