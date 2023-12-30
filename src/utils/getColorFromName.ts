const colors = [
    'bg-red', 'bg-orange', 'bg-amber-500', 'bg-green', 'bg-green2',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
    'bg-rose-500','bg-lime-500', 'bg-pink', 'bg-redError', 'bg-marine', 
];
const shadows = [
    'shadow-red', 'shadow-orange', 'shadow-amber-500/50', 'shadow-green', 'shadow-green2',
    'shadow-emerald-500/50', 'shadow-teal-500/50', 'shadow-cyan-500/50', 'shadow-sky-500/50',
    'shadow-indigo-500/50', 'shadow-violet-500/50', 'shadow-purple-500/50', 'shadow-fuchsia-500/50',
    'shadow-rose-500/50','shadow-lime-500/50', 'shadow-pink', 'shadow-redError', 'shadow-marine'
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