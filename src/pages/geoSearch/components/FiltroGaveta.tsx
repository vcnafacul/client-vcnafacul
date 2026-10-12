import { MapFilterOptions } from "@/components/organisms/mapFilterCard";
import { checkMapFilter } from "@/pages/homeLegacy/data";
import { TypeMarker } from "@/types/map/marker";
import { ListFilter } from "lucide-react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

/** Largura do card; fechado, ele sai inteiro da tela e só a aba fica à vista. */
export const LARGURA_DA_GAVETA_PX = 224;
/** Arrasto (ou arremesso) a partir do qual a gaveta troca de estado. */
const LIMIAR_DO_ARRASTO_PX = 60;
const LIMIAR_DA_VELOCIDADE = 300;

/**
 * Filtro do mapa no celular e no tablet: um card que mora fora da tela, à
 * esquerda, com só a aba (o funil) à mostra. Tocar na aba ou puxá-la para a
 * direita abre; tocar fora, na aba, arrastar de volta ou Esc fecha.
 *
 * ⚠️ Não é modal: o mapa continua usável com ela aberta — por isso não prende
 * o foco. Fechada, o card fica `inert` (fora do Tab e do leitor de tela).
 */
export function FiltroGaveta({
  filterMarkers,
  onToggle,
  className = "",
}: {
  filterMarkers: TypeMarker[];
  onToggle: (t: TypeMarker) => void;
  className?: string;
}) {
  const [aberta, setAberta] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const aba = useRef<HTMLButtonElement>(null);
  /** O `click` que encerra um arrasto não pode alternar de novo. */
  const arrastou = useRef(false);
  const idDoCard = useId();
  const reduzido = useReducedMotion();
  const controles = useAnimationControls();
  const transicao = reduzido
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 38 };

  // ⚠️ Por controles, e não pelo `animate`: um arrasto curto que não troca o
  // estado tem de voltar à posição — e o `animate` com o mesmo alvo não anima.
  const assentar = (abrir: boolean) =>
    controles.start({ x: abrir ? 0 : -LARGURA_DA_GAVETA_PX }, transicao);

  useEffect(() => {
    void assentar(aberta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta]);

  // Toque fora (no mapa, na lista) fecha; Esc fecha e devolve o foco à aba.
  useEffect(() => {
    if (!aberta) return;
    const aoTocar = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberta(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setAberta(false);
      aba.current?.focus();
    };
    document.addEventListener("pointerdown", aoTocar);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("pointerdown", aoTocar);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberta]);

  const ativos = checkMapFilter.filter((f) =>
    filterMarkers.includes(f.type),
  ).length;
  const filtrando = ativos < checkMapFilter.length;

  return (
    <motion.div
      ref={raiz}
      data-slot="filtro-gaveta"
      data-aberta={aberta || undefined}
      className={`absolute left-0 z-30 flex items-start ${className}`}
      initial={{ x: -LARGURA_DA_GAVETA_PX }}
      animate={controles}
      drag="x"
      dragConstraints={{ left: -LARGURA_DA_GAVETA_PX, right: 0 }}
      dragElastic={0.08}
      dragMomentum={false}
      onDragStart={() => {
        arrastou.current = true;
      }}
      onDragEnd={(_, { offset, velocity }) => {
        // O `click` do fim do arrasto chega logo depois deste evento; passado
        // ele, um toque na aba volta a valer (arrasto que começa no card não
        // gera `click` na aba).
        setTimeout(() => {
          arrastou.current = false;
        }, 0);
        const abrir =
          offset.x > LIMIAR_DO_ARRASTO_PX || velocity.x > LIMIAR_DA_VELOCIDADE;
        const fechar =
          offset.x < -LIMIAR_DO_ARRASTO_PX ||
          velocity.x < -LIMIAR_DA_VELOCIDADE;
        const nova = abrir ? true : fechar ? false : aberta;
        setAberta(nova);
        void assentar(nova);
      }}
    >
      <div
        id={idDoCard}
        role="group"
        aria-label="Filtros do mapa"
        inert={!aberta}
        style={{ width: LARGURA_DA_GAVETA_PX }}
        className="
          rounded-r-2xl border border-l-0 border-white/40 bg-white/70 p-3
          text-marine shadow-lg backdrop-blur-xl backdrop-saturate-150
          [&_label]:!text-[#0b2747]
        "
      >
        <MapFilterOptions filterMarkers={filterMarkers} onToggle={onToggle} />
      </div>
      <button
        ref={aba}
        type="button"
        aria-expanded={aberta}
        aria-controls={idDoCard}
        aria-label={aberta ? "Esconder filtros" : "Mostrar filtros"}
        onClick={() => {
          if (arrastou.current) return;
          setAberta((a) => !a);
        }}
        className="
          relative mt-3 flex h-12 w-8 touch-none items-center justify-center
          rounded-r-xl border border-l-0 border-white/40 bg-white/80 text-marine
          shadow-lg backdrop-blur-xl
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marine
        "
      >
        <ListFilter aria-hidden className="h-5 w-5" />
        {filtrando && (
          // Algum tipo desligado: o ponto avisa que o mapa está filtrado.
          <span
            data-slot="filtrando"
            className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange"
          />
        )}
      </button>
    </motion.div>
  );
}
