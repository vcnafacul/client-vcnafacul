/** Tons escuros (600/700) para garantir contraste com texto branco nos badges. */
const colors = [
  'bg-red-600',
  'bg-orange-600',
  'bg-amber-600',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-sky-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-pink-600',
  'bg-rose-600',
  'bg-lime-600',
  'bg-blue-600',
  'bg-slate-600',
];

const shadows = [
  'shadow-red-600/50',
  'shadow-orange-600/50',
  'shadow-amber-600/50',
  'shadow-emerald-600/50',
  'shadow-teal-600/50',
  'shadow-cyan-600/50',
  'shadow-sky-600/50',
  'shadow-indigo-600/50',
  'shadow-violet-600/50',
  'shadow-purple-600/50',
  'shadow-fuchsia-600/50',
  'shadow-pink-600/50',
  'shadow-rose-600/50',
  'shadow-lime-600/50',
  'shadow-blue-600/50',
  'shadow-slate-600/50',
];

const getIndex = (name: string) => {
    const hashCode = name.split('').reduce((acc, char) => {
        const code = char.charCodeAt(0);
        return acc + code;
    }, 0);

    return (hashCode) % colors.length;
}

export const getColorFromName = (name: string) => {
    const index = getIndex(name)
    return `${colors[index]}`;
};

export const getShadowColorFromName = (name: string) => {
    const index = getIndex(name)
    return `${shadows[index]}`;
};