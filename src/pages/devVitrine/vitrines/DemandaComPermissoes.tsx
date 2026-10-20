import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { Roles } from "@/enums/roles/roles";
import ValidatedDemand from "@/pages/dashContent/modals/validatedDemand";
import { useAuthStore } from "@/store/auth";
import { useEffect, useMemo } from "react";

const nada = () => {};

/**
 * O modal lê a permissão do `useAuthStore`; quem abre a vitrine pode não ter
 * `validarDemanda`, e os botões ficariam cinza. Empresta as duas permissões
 * enquanto o estado está montado e devolve as originais ao sair.
 *
 * ⚠️ A demanda é congelada na primeira montagem: a vitrine cria um objeto
 * novo a cada render, e o efeito do modal (depende de `demand.file`) refazia
 * o download do arquivo e empilhava toasts.
 */
export function DemandaComPermissoes({ demand }: { demand: ContentDtoInput }) {
  useEffect(() => {
    const antes = useAuthStore.getState().data;
    useAuthStore.setState({
      data: {
        ...antes,
        permissao: {
          ...antes.permissao,
          [Roles.validarDemanda]: true,
          [Roles.uploadDemanda]: true,
        },
      },
    });
    return () => useAuthStore.setState({ data: antes });
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const d = useMemo(() => demand, []);
  return <ValidatedDemand isOpen demand={d} handleClose={nada} updateStatusDemand={nada} />;
}

