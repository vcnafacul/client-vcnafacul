import MapBox from "@/components/molecules/mapBox";
import ReportLC from "@/components/organisms/map/modal/report";
import { MapFilterCard } from "@/components/organisms/mapFilterCard";
import { MapInfoCard } from "@/components/organisms/mapInfoCard";
import { TypeProblem } from "@/enums/audit/typeProblem";
import { Marker, TypeMarker } from "@/types/map/marker";
import leaflet, { type Map as LeafletMap } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import BaseTemplate from "../../components/templates/baseTemplate";
import { GEOLOCATION_REGISTER } from "../../routes/path";
import { BuscaCursinhos } from "./components/BuscaCursinhos";
import { GeoCardList } from "./components/GeoCardList";
import { MapaController } from "./components/MapaController";
import {
  LIMITE_CELULAR,
  LIMITE_DESKTOP,
  Limites,
  buscarCursinhos,
  cursinhosNaArea,
  normalizar,
} from "./regras";
import { useGeoPublico, useTelaEstreita } from "./useGeoPublico";

const FILTROS_INICIAIS: TypeMarker[] = [TypeMarker.geo, TypeMarker.univPublic];
const ZOOM_AO_ESCOLHER = 14;
export const ESPERA_DA_BUSCA_MS = 250;
/** Meia largura do cartão do mapa no desktop (420px). */
export const DESLOCAMENTO_DO_CARTAO_PX = 210;

/**
 * Localiza Cursinho (`/localiza-cursinho`, tickets/022): o passo ANTES do
 * cadastro — a pessoa confere se o cursinho já está na plataforma.
 *
 * Card 04 montou o esqueleto; o 05 pôs mapa e lista, sincronizados pela área
 * visível (como no QuintoAndar); o 06, a busca rápida — com termo, lista e
 * pins passam a ser os resultados, e o termo fica em `?q=` (dá para
 * compartilhar e voltar); o 07, o cartão do cursinho sobre o mapa, com
 * reportar. Falta o modal do cadastro (08).
 *
 * ⚠️ Breakpoints do projeto: `md` = 1200px. Metade/metade de 1200px para
 * cima; abaixo disso, mapa em cima (45vh) e lista embaixo.
 */
function GeoSearch() {
  const { geos, estado, tentarDeNovo } = useGeoPublico();
  const estreita = useTelaEstreita();
  const [filtros, setFiltros] = useState<TypeMarker[]>(FILTROS_INICIAIS);
  const [limites, setLimites] = useState<Limites | null>(null);
  /** Destaque vindo do hover/foco na lista. */
  const [focoId, setFocoId] = useState<string | null>(null);
  /** Escolhido pelo clique no card ou no pin (abre o card do mapa no 07). */
  const [escolhidoId, setEscolhidoId] = useState<string | null>(null);
  const [reportando, setReportando] = useState(false);
  const mapa = useRef<LeafletMap | null>(null);
  const [mapaPronto, setMapaPronto] = useState(false);
  const cards = useRef(new Map<string, HTMLElement>());

  // Busca (06): o que se digita, e o termo que vale (depois da espera).
  const [params, setParams] = useSearchParams();
  const [texto, setTexto] = useState(() => params.get("q") ?? "");
  const [termo, setTermo] = useState(texto);
  useEffect(() => {
    const t = setTimeout(() => setTermo(texto), ESPERA_DA_BUSCA_MS);
    return () => clearTimeout(t);
  }, [texto]);
  useEffect(() => {
    const limpo = termo.trim();
    setParams(
      (atual) => {
        const novo = new URLSearchParams(atual);
        if (limpo) novo.set("q", limpo);
        else novo.delete("q");
        return novo;
      },
      { replace: true },
    );
  }, [termo, setParams]);

  const buscando = normalizar(termo) !== "";
  const resultados = useMemo(() => buscarCursinhos(geos, termo), [geos, termo]);

  /*
    ⚠️ Memoizado só por dados e filtro — NUNCA pela área visível. O
    `ClusteredMarkers` recria o cluster sempre que `markers` muda de
    referência; se dependesse do `limites`, o mapa piscaria a cada arrasto.
  */
  const markers = useMemo<Marker[]>(
    () =>
      (buscando
        ? resultados
        : geos.filter((g) => filtros.includes(g.type))
      ).map((g) => ({
        id: g.id,
        lat: g.latitude,
        lon: g.longitude,
        type: g.type,
        infos: g,
      })),
    [geos, filtros, buscando, resultados],
  );

  const limite = estreita ? LIMITE_CELULAR : LIMITE_DESKTOP;
  /*
    Com termo, a lista é a da busca e mexer no mapa NÃO a troca; sem termo,
    volta a ser a da área visível (05).
  */
  const { itens, total } = useMemo(
    () =>
      buscando
        ? { itens: resultados.slice(0, limite), total: resultados.length }
        : cursinhosNaArea(geos, limites, limite),
    [buscando, resultados, geos, limites, limite],
  );
  const semResultado =
    buscando && estado === "pronto" && resultados.length === 0;

  // Enquadra os resultados: um só → voa até ele; vários → cabem todos.
  useEffect(() => {
    const m = mapa.current;
    if (!buscando || !mapaPronto || !m || resultados.length === 0) return;
    if (resultados.length === 1) {
      const [r] = resultados;
      m.flyTo([r.latitude, r.longitude], ZOOM_AO_ESCOLHER);
      return;
    }
    m.fitBounds(
      leaflet.latLngBounds(resultados.map((r) => [r.latitude, r.longitude])),
      { padding: [48, 48] },
    );
  }, [buscando, resultados, mapaPronto]);

  const alternarFiltro = (t: TypeMarker) =>
    setFiltros((atual) =>
      atual.includes(t) ? atual.filter((x) => x !== t) : [...atual, t],
    );

  const escolherNaLista = (id: string) => {
    const geo = geos.find((g) => g.id === id);
    if (!geo) return;
    setEscolhidoId(id);
    const m = mapa.current;
    if (!m) return;
    /*
      O cartão do mapa (07) abre no canto inferior direito, e o voo
      centralizado deixava o pin escolhido ESCONDIDO atrás dele. No desktop, o
      centro vai meia largura do cartão para a direita — o pin fica à esquerda
      do cartão. No celular o cartão é um painel por cima do mapa, como na home.
    */
    const deslocamento = estreita ? 0 : DESLOCAMENTO_DO_CARTAO_PX;
    const alvo = m.unproject(
      m
        .project([geo.latitude, geo.longitude], ZOOM_AO_ESCOLHER)
        .add([deslocamento, 0]),
      ZOOM_AO_ESCOLHER,
    );
    m.flyTo(alvo, ZOOM_AO_ESCOLHER);
  };

  const escolherNoMapa = useCallback((id: string) => {
    setEscolhidoId(id);
    cards.current
      .get(id)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  // Cartão do mapa (07): o escolhido, venha da lista ou do pin.
  const escolhido = useMemo<Marker | null>(() => {
    const g = escolhidoId ? geos.find((x) => x.id === escolhidoId) : null;
    return g
      ? { id: g.id, lat: g.latitude, lon: g.longitude, type: g.type, infos: g }
      : null;
  }, [escolhidoId, geos]);
  const fecharCartao = useCallback(() => setEscolhidoId(null), []);

  // Esc fecha o cartão — mas não enquanto o modal de reportar está aberto
  // (ali o Esc é do modal).
  useEffect(() => {
    if (!escolhido || reportando) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fecharCartao();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [escolhido, reportando, fecharCartao]);

  const refDoCard = useCallback((id: string, el: HTMLElement | null) => {
    if (el) cards.current.set(id, el);
    else cards.current.delete(id);
  }, []);

  const controller = useMemo(
    () => (
      <MapaController
        onLimites={setLimites}
        onMapa={(m) => {
          mapa.current = m;
          setMapaPronto(true);
        }}
        onCliqueNoMapa={fecharCartao}
      />
    ),
    [fecharCartao],
  );

  return (
    <BaseTemplate solid className="bg-white">
      <div className="grid grid-cols-1 md:h-[calc(100vh-76px)] md:grid-cols-2">
        <section
          aria-labelledby="localiza-titulo"
          className="relative order-2 overflow-hidden md:order-1 md:overflow-y-auto"
        >
          {/*
            Menor que o `.graphism` da tela de cadastro (446px): nesta coluna,
            o tamanho padrão cobria o título e o texto.
          */}
          <TriangleGreen
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-6 h-24 w-24 rotate-180 md:-left-16 md:-top-10 md:h-40 md:w-40"
          />
          <div className="relative z-10 flex flex-col gap-6 px-4 pb-8 pt-14 sm:px-8 md:min-h-full md:px-12 md:pt-24">
            <header className="space-y-2">
              <h1
                id="localiza-titulo"
                className="text-3xl font-black text-marine md:text-4xl"
              >
                Localize um Cursinho
              </h1>
              <p className="text-slate-600">
                Antes de cadastrar um novo cursinho, verifique se este não se
                encontra em nossa plataforma.
              </p>
            </header>

            <div
              data-slot="lista"
              // Sem resultado, o cadastro sobe para perto do aviso.
              className={semResultado ? "" : "flex-1"}
            >
              <GeoCardList
                modo={buscando ? "busca" : "area"}
                termo={termo.trim()}
                estado={estado}
                itens={itens}
                total={total}
                ativoId={focoId ?? escolhidoId}
                onFoco={setFocoId}
                onEscolher={escolherNaLista}
                tentarDeNovo={tentarDeNovo}
                refDoCard={refDoCard}
              />
            </div>

            {/*
              08 troca por botão + modal "você não encontrou?". Até lá, um
              link direto: se a develop subir antes do 05/08, a pessoa ainda
              consegue cadastrar.
            */}
            <div
              data-slot="cadastro"
              data-destaque={semResultado || undefined}
              className={`space-y-2 border-t pt-6 transition ${
                semResultado
                  ? "-mx-4 rounded-2xl border-t-0 bg-orange/10 p-4 ring-2 ring-orange/50"
                  : ""
              }`}
            >
              <p className="text-sm text-slate-600">
                Não encontrou um cursinho que conhece?
              </p>
              <Link
                to={GEOLOCATION_REGISTER}
                className="inline-flex rounded-full bg-orange px-6 py-3 font-bold text-white hover:opacity-90"
              >
                Cadastre um novo cursinho
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-label="Mapa de cursinhos"
          className="relative order-1 h-[45vh] bg-slate-100 md:order-2 md:h-full"
        >
          {/* 07: card do cursinho */}
          <div
            data-slot="busca"
            className="absolute left-14 right-3 top-3 z-[500] md:left-1/2 md:right-auto md:top-6 md:w-[min(28rem,80%)] md:-translate-x-1/2"
          >
            <BuscaCursinhos valor={texto} onMudar={setTexto} />
          </div>
          <div
            data-slot="mapa"
            className="h-full w-full [&>div:first-child]:h-full"
          >
            <MapBox
              className="z-0 h-full w-full"
              markers={markers}
              onMarkerClick={escolherNoMapa}
              activeId={focoId ?? escolhidoId}
              scrollWheelZoom
              mapEvent={controller}
            />
          </div>
          {/* Na busca só entram cursinhos: o filtro de tipo sai de cena. */}
          {!buscando && (
            <MapFilterCard
              filterMarkers={filtros}
              onToggle={alternarFiltro}
              className="bottom-3 left-3 md:bottom-6 md:left-6"
            />
          )}
          <div data-slot="card-do-mapa">
            <MapInfoCard
              activeMarker={escolhido}
              onReport={() => setReportando(true)}
              onClose={fecharCartao}
              // ⚠️ Sem `ctaLink`: o cadastro já está na coluna da esquerda, e o
              // link levaria para esta mesma página.
              // Altura relativa ao mapa (no celular ele tem só 45vh), sem
              // cobrir a busca no topo.
              className="left-3 right-3 bottom-3 z-[600] max-h-[calc(100%-5.5rem)] md:left-auto md:right-6 md:bottom-6 md:w-[420px] md:max-h-[calc(100%-8rem)]"
              acoes={<div data-slot="confirmacao-mapa" />}
            />
          </div>
          {reportando && escolhido && (
            <ReportLC
              entityId={escolhido.id}
              entityName={escolhido.infos.name}
              type={
                escolhido.type === TypeMarker.geo
                  ? TypeProblem.GEO
                  : TypeProblem.COLLEGE
              }
              isOpen={reportando}
              handleClose={() => setReportando(false)}
            />
          )}
        </section>
      </div>
    </BaseTemplate>
  );
}

export default GeoSearch;
