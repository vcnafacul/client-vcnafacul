import MapBox from "@/components/molecules/mapBox";
import { MapFilterCard } from "@/components/organisms/mapFilterCard";
import { Marker, TypeMarker } from "@/types/map/marker";
import type { Map as LeafletMap } from "leaflet";
import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import BaseTemplate from "../../components/templates/baseTemplate";
import { GEOLOCATION_REGISTER } from "../../routes/path";
import { GeoCardList } from "./components/GeoCardList";
import { MapaController } from "./components/MapaController";
import {
  LIMITE_CELULAR,
  LIMITE_DESKTOP,
  Limites,
  cursinhosNaArea,
} from "./regras";
import { useGeoPublico, useTelaEstreita } from "./useGeoPublico";

const FILTROS_INICIAIS: TypeMarker[] = [TypeMarker.geo, TypeMarker.univPublic];
const ZOOM_AO_ESCOLHER = 14;

/**
 * Localiza Cursinho (`/localiza-cursinho`, tickets/022): o passo ANTES do
 * cadastro — a pessoa confere se o cursinho já está na plataforma.
 *
 * Card 04 montou o esqueleto; o 05 pôs mapa e lista, sincronizados pela área
 * visível (como no QuintoAndar). Os `data-slot` restantes: busca (06), card
 * do mapa (07), cadastro (08).
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
  const mapa = useRef<LeafletMap | null>(null);
  const cards = useRef(new Map<string, HTMLElement>());

  /*
    ⚠️ Memoizado só por dados e filtro — NUNCA pela área visível. O
    `ClusteredMarkers` recria o cluster sempre que `markers` muda de
    referência; se dependesse do `limites`, o mapa piscaria a cada arrasto.
  */
  const markers = useMemo<Marker[]>(
    () =>
      geos
        .filter((g) => filtros.includes(g.type))
        .map((g) => ({
          id: g.id,
          lat: g.latitude,
          lon: g.longitude,
          type: g.type,
          infos: g,
        })),
    [geos, filtros],
  );

  const { itens, total } = useMemo(
    () =>
      cursinhosNaArea(
        geos,
        limites,
        estreita ? LIMITE_CELULAR : LIMITE_DESKTOP,
      ),
    [geos, limites, estreita],
  );

  const alternarFiltro = (t: TypeMarker) =>
    setFiltros((atual) =>
      atual.includes(t) ? atual.filter((x) => x !== t) : [...atual, t],
    );

  const escolherNaLista = (id: string) => {
    const geo = geos.find((g) => g.id === id);
    if (!geo) return;
    setEscolhidoId(id);
    mapa.current?.flyTo([geo.latitude, geo.longitude], ZOOM_AO_ESCOLHER);
  };

  const escolherNoMapa = useCallback((id: string) => {
    setEscolhidoId(id);
    cards.current
      .get(id)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const refDoCard = useCallback((id: string, el: HTMLElement | null) => {
    if (el) cards.current.set(id, el);
    else cards.current.delete(id);
  }, []);

  const controller = useMemo(
    () => (
      <MapaController
        onLimites={setLimites}
        onMapa={(m) => (mapa.current = m)}
      />
    ),
    [],
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

            <div data-slot="lista" className="flex-1">
              <GeoCardList
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
            <div data-slot="cadastro" className="space-y-2 border-t pt-6">
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
          {/* 06: busca · 07: card do cursinho */}
          <div data-slot="busca" />
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
          <MapFilterCard filterMarkers={filtros} onToggle={alternarFiltro} />
          <div data-slot="card-do-mapa" />
        </section>
      </div>
    </BaseTemplate>
  );
}

export default GeoSearch;
