import {
  confirmGeo,
  getMyConfirmations,
  unconfirmGeo,
} from "@/services/geolocation/confirmation";
import { useAuthStore } from "@/store/auth";
import type { PublicGeolocation } from "@/types/geolocation/publicGeolocation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

/**
 * "Informação correta" (card 09). Um estado só para a lista e o cartão do
 * mapa — os dois mudam juntos.
 *
 * ⚠️ **Otimista**: contador e cor mudam na hora; se a api falhar, desfaz e
 * avisa. Enquanto a request está em voo, o botão daquele cursinho fica
 * desabilitado (duplo clique não manda duas).
 */
export function useConfirmacoes() {
  const token = useAuthStore((s) => s.data.token);
  const [minhas, setMinhas] = useState<Set<string>>(new Set());
  const [ajuste, setAjuste] = useState<Map<string, number>>(new Map());
  const [emVoo, setEmVoo] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMinhas(new Set());
    setAjuste(new Map());
    if (!token) return;
    let ativo = true;
    getMyConfirmations(token)
      .then((ids) => ativo && setMinhas(new Set(ids)))
      .catch(() => {
        /* sem o "me", os botões só aparecem desmarcados */
      });
    return () => {
      ativo = false;
    };
  }, [token]);

  const contagem = useCallback(
    (g: PublicGeolocation) => (g.confirmations ?? 0) + (ajuste.get(g.id) ?? 0),
    [ajuste],
  );

  const mudar = (id: string, confirmar: boolean) => {
    setMinhas((atual) => {
      const novo = new Set(atual);
      if (confirmar) novo.add(id);
      else novo.delete(id);
      return novo;
    });
    setAjuste((atual) =>
      new Map(atual).set(id, (atual.get(id) ?? 0) + (confirmar ? 1 : -1)),
    );
  };

  const alternar = async (id: string) => {
    if (!token || emVoo.has(id)) return;
    const confirmar = !minhas.has(id);
    mudar(id, confirmar);
    setEmVoo((a) => new Set(a).add(id));
    try {
      await (confirmar ? confirmGeo : unconfirmGeo)(token, id);
    } catch (e) {
      mudar(id, !confirmar); // desfaz o otimista
      toast.error((e as Error).message);
    } finally {
      setEmVoo((a) => {
        const novo = new Set(a);
        novo.delete(id);
        return novo;
      });
    }
  };

  return {
    logado: !!token,
    confirmado: (id: string) => minhas.has(id),
    emVoo: (id: string) => emVoo.has(id),
    contagem,
    alternar,
  };
}
