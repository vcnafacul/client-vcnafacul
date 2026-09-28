import { buscarGeoPublico } from "@/services/geolocation/getGeolocation";
import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export type EstadoDaCarga = "carregando" | "erro" | "pronto";

/** Todos os aprovados, uma vez (são poucas dezenas — README da série). */
export function useGeoPublico() {
  const [geos, setGeos] = useState<PublicGeolocation[]>([]);
  const [estado, setEstado] = useState<EstadoDaCarga>("carregando");

  const carregar = useCallback(() => {
    let ativo = true;
    setEstado("carregando");
    buscarGeoPublico()
      .then((lista) => {
        if (!ativo) return;
        setGeos(lista);
        setEstado("pronto");
      })
      .catch((e: Error) => {
        if (!ativo) return;
        setEstado("erro");
        toast.error(e.message);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(carregar, [carregar]);

  return { geos, estado, tentarDeNovo: carregar };
}

/** Abaixo de 1200px (o `md` do projeto) a tela empilha e a lista encurta. */
export function useTelaEstreita(): boolean {
  const consulta = "(max-width: 1199px)";
  const [estreita, setEstreita] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia?.(consulta).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia?.(consulta);
    if (!mql) return;
    const mudar = () => setEstreita(mql.matches);
    mql.addEventListener("change", mudar);
    return () => mql.removeEventListener("change", mudar);
  }, []);
  return !!estreita;
}
