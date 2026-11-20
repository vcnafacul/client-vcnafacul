/**
 * Paleta fechada de pares fundo/texto com contraste AA (texto branco sobre o token
 * sólido). Só tokens semânticos: a paleta antiga de 16 matizes saiu com o design
 * system, então as cores repetem mais (8 em vez de 16).
 */
const palette: { bg: string; text: string; shadow: string }[] = [
  { bg: 'bg-primary', text: 'text-primary-foreground', shadow: 'shadow-primary/50' },
  { bg: 'bg-destructive', text: 'text-destructive-foreground', shadow: 'shadow-destructive/50' },
  { bg: 'bg-success', text: 'text-success-foreground', shadow: 'shadow-success/50' },
  { bg: 'bg-warning', text: 'text-warning-foreground', shadow: 'shadow-warning/50' },
  { bg: 'bg-info', text: 'text-info-foreground', shadow: 'shadow-info/50' },
  { bg: 'bg-cta', text: 'text-cta-foreground', shadow: 'shadow-cta/50' },
  { bg: 'bg-muted-foreground', text: 'text-background', shadow: 'shadow-muted-foreground/50' },
  { bg: 'bg-foreground', text: 'text-background', shadow: 'shadow-foreground/50' },
];

const getIndex = (name: string) => {
    const hashCode = name.split('').reduce((acc, char) => {
        const code = char.charCodeAt(0);
        return acc + code;
    }, 0);

    return (hashCode) % palette.length;
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
