// client-vcnafacul/src/pages/homeV2/sections/MapSection/MapHeaderCard.tsx
export function MapHeaderCard() {
  return (
    <div
      className="
        absolute z-[400] top-3 left-3 right-3 md:top-6 md:left-6 md:right-auto md:max-w-[520px]
        bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/40
        rounded-2xl shadow-lg p-5 md:p-6 text-marine
      "
    >
      <p className="home-section__eyebrow mb-1" style={{ color: "#da005a" }}>
        ENCONTRE PERTO
      </p>
      <h2 className="text-xl md:text-2xl font-extrabold leading-tight">
        Cursinho popular do seu bairro
      </h2>
      <p className="text-xs md:text-sm opacity-75 mt-1">
        Filtros pra refinar; toque num pin pra ver detalhes.
      </p>
    </div>
  );
}
