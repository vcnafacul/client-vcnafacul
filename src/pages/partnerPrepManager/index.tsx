import { DashListTemplate, type DashAction } from "@/components/dashV2";
import { FilterProps } from "@/components/atoms/filter";
import { CardDash } from "@/components/molecules/cardDash";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { useModals } from "@/hooks/useModal";
import { getTodosOsCursinhos } from "@/services/prepCourse/prepCourse/getPartnerPrepCourse";
import { useAuthStore } from "@/store/auth";
import { PartnerPrepCourse } from "@/types/partnerPrepCourse/partnerPrepCourse";
import { Paginate } from "@/utils/paginate";
import { useCallback, useEffect, useMemo, useState } from "react";
import { colunasDoCursinho, ORDENACAO_PADRAO } from "./columns";
import { ModalCreatePrepCourse } from "./modals/ModalCreatePrepCourse";
import { ModalShowPrepCourse } from "./modals/ModalShowPrepCourse";

export default function PartnerPrepManager() {
  const {
    data: { token },
  } = useAuthStore();

  const [entities, setEntities] = useState<PartnerPrepCourse[]>([]);
  const [entitySelected, setEntitySelected] =
    useState<PartnerPrepCourse | null>(null);
  const [busca, setBusca] = useState("");
  // Três estados do template V2: o erro vira "tentar de novo" (antes a lista
  // ficava vazia calada — o serviço engolia o erro).
  const [estado, setEstado] = useState<"idle" | "loading" | "error">("loading");

  const modals = useModals(["modalCreatePrepCourse", "modalShowPrepCourse"]);

  const limitCards = 100;

  const carregar = useCallback(async () => {
    setEstado("loading");
    try {
      setEntities(await getTodosOsCursinhos(token));
      setEstado("idle");
    } catch {
      setEstado("error");
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // O V2 não pagina pelo servidor; o Provider ainda exige a função.
  const getMoreCards = async (): Promise<Paginate<PartnerPrepCourse>> => ({
    data: [],
    page: 0,
    limit: 0,
    totalItems: 0,
  });

  // O template ainda tira o `id` do clique daqui.
  const cardTransformation = (ppc: PartnerPrepCourse): CardDash => ({
    id: ppc.id,
    title: ppc.geo.name,
    status: StatusEnum.Approved,
    infos: [],
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return entities;
    return entities.filter((c) =>
      [c.geo?.name, c.geo?.city, c.geo?.state, c.representative?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [entities, busca]);

  const filterProps: FilterProps = {
    placeholder: "Nome, cidade, UF ou coordenador",
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value),
    defaultValue: busca,
  };

  const onClickCard = (id: string) => {
    setEntitySelected(entities.find((e) => e.id === id)!);
    modals.modalShowPrepCourse.open();
  };

  const ShowPrepCourse = () => {
    return modals.modalShowPrepCourse.isOpen ? (
      <ModalShowPrepCourse
        isOpen={modals.modalShowPrepCourse.isOpen}
        handleClose={() => modals.modalShowPrepCourse.close()}
        prepCourse={entitySelected!}
      />
    ) : null;
  };

  const CreatePrepCourse = () => {
    return modals.modalCreatePrepCourse.isOpen ? (
      <ModalCreatePrepCourse
        isOpen={modals.modalCreatePrepCourse.isOpen}
        handleClose={() => modals.modalCreatePrepCourse.close()}
        onSuccess={(prep: PartnerPrepCourse) => {
          modals.modalCreatePrepCourse.close();
          setEntities((atual) => [prep, ...atual]);
        }}
      />
    ) : null;
  };

  const acaoPrimaria: DashAction = {
    id: "novo-cursinho",
    label: "Cadastrar cursinho",
    onClick: () => modals.modalCreatePrepCourse.open(),
  };

  return (
    <DashCardContext.Provider
      value={{
        title: "Gerenciamento de Cursinho",
        entities: filtrados,
        setEntities,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        filterProps,
        totalItems: filtrados.length,
      }}
    >
      <DashListTemplate<PartnerPrepCourse>
        columns={colunasDoCursinho}
        actions={{ primary: acaoPrimaria }}
        activeFilterCount={busca.trim() ? 1 : 0}
        totalSemFiltro={entities.length}
        onClearFilters={() => setBusca("")}
        defaultSort={ORDENACAO_PADRAO}
        state={estado}
        onRetry={carregar}
        textoVazio="Nenhum cursinho parceiro cadastrado"
      />
      {ShowPrepCourse()}
      {CreatePrepCourse()}
    </DashCardContext.Provider>
  );
}
