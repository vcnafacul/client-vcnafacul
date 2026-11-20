import { palette } from '@/lib/palette';

/**
 * Cores dos gráficos, tiradas da paleta (`src/lib/palette.ts`). Recharts pinta
 * SVG com atributo, então precisa do valor e não da classe Tailwind. Todas
 * passam de 3:1 sobre branco (o eixo, que é texto, passa de 4,5:1).
 */
export const chartColors = {
  primary: palette.marine[900],
  accent: palette.mint[600],
  warn: palette.orange[600],
  danger: palette.red[600],
  grid: palette.neutral[200],
  axis: palette.neutral[500],
  track: palette.neutral[100],
};
