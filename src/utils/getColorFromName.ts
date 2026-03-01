/** Paleta fechada de cores com contraste garantido para badges/labels. */
const palette: { bg: string; text: string; shadow: string }[] = [
  { bg: 'bg-red-700',     text: 'text-white', shadow: 'shadow-red-700/50' },
  { bg: 'bg-orange-700',  text: 'text-white', shadow: 'shadow-orange-700/50' },
  { bg: 'bg-amber-800',   text: 'text-white', shadow: 'shadow-amber-800/50' },
  { bg: 'bg-emerald-700', text: 'text-white', shadow: 'shadow-emerald-700/50' },
  { bg: 'bg-teal-700',    text: 'text-white', shadow: 'shadow-teal-700/50' },
  { bg: 'bg-cyan-800',    text: 'text-white', shadow: 'shadow-cyan-800/50' },
  { bg: 'bg-sky-700',     text: 'text-white', shadow: 'shadow-sky-700/50' },
  { bg: 'bg-indigo-700',  text: 'text-white', shadow: 'shadow-indigo-700/50' },
  { bg: 'bg-violet-700',  text: 'text-white', shadow: 'shadow-violet-700/50' },
  { bg: 'bg-purple-700',  text: 'text-white', shadow: 'shadow-purple-700/50' },
  { bg: 'bg-fuchsia-700', text: 'text-white', shadow: 'shadow-fuchsia-700/50' },
  { bg: 'bg-pink-700',    text: 'text-white', shadow: 'shadow-pink-700/50' },
  { bg: 'bg-rose-700',    text: 'text-white', shadow: 'shadow-rose-700/50' },
  { bg: 'bg-lime-800',    text: 'text-white', shadow: 'shadow-lime-800/50' },
  { bg: 'bg-blue-700',    text: 'text-white', shadow: 'shadow-blue-700/50' },
  { bg: 'bg-slate-700',   text: 'text-white', shadow: 'shadow-slate-700/50' },
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
