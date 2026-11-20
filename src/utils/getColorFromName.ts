/**
 * Cor de identidade por nome (tickets/059 R26): acento categórico `chart-1…6`
 * (borda à esquerda) sobre superfície neutra, com texto `text-foreground`. Nunca
 * usa token de status, porque a cor aqui não quer dizer situação nenhuma.
 */
const palette: { bg: string; text: string; shadow: string }[] = [
  { bg: 'bg-muted border-l-4 border-chart-1', text: 'text-foreground', shadow: 'shadow-chart-1/50' },
  { bg: 'bg-muted border-l-4 border-chart-2', text: 'text-foreground', shadow: 'shadow-chart-2/50' },
  { bg: 'bg-muted border-l-4 border-chart-3', text: 'text-foreground', shadow: 'shadow-chart-3/50' },
  { bg: 'bg-muted border-l-4 border-chart-4', text: 'text-foreground', shadow: 'shadow-chart-4/50' },
  { bg: 'bg-muted border-l-4 border-chart-5', text: 'text-foreground', shadow: 'shadow-chart-5/50' },
  { bg: 'bg-muted border-l-4 border-chart-6', text: 'text-foreground', shadow: 'shadow-chart-6/50' },
];

const getIndex = (name: string) => {
    const hash = name.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
    return hash % palette.length;
}

export const getColorFromName = (name: string) => {
    const index = getIndex(name);
    return palette[index].bg;
};

export const getTextColorFromName = (name: string) => {
    const index = getIndex(name);
    return palette[index].text;
};

export const getShadowColorFromName = (name: string) => {
    const index = getIndex(name);
    return palette[index].shadow;
};
