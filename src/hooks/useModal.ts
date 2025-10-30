import { useCallback, useState } from "react";

/**
 * Hook para gerenciar o estado de um modal (abrir/fechar)
 *
 * @param initialState - Estado inicial do modal (padrão: false)
 * @returns Objeto com estado e funções para controlar o modal
 *
 * @example
 * const modal = useModal();
 *
 * // Usar no componente
 * <Modal isOpen={modal.isOpen} onClose={modal.close}>...</Modal>
 * <Button onClick={modal.open}>Abrir Modal</Button>
 *
 * // Ou com toggle
 * <Button onClick={modal.toggle}>Toggle Modal</Button>
 */
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * Hook para gerenciar múltiplos modais com um único hook
 *
 * @param modalNames - Array com os nomes dos modais
 * @returns Objeto com funções para cada modal
 *
 * @example
 * const modals = useModals(['create', 'edit', 'delete']);
 *
 * // Usar no componente
 * <CreateModal isOpen={modals.create.isOpen} onClose={modals.create.close} />
 * <EditModal isOpen={modals.edit.isOpen} onClose={modals.edit.close} />
 * <Button onClick={modals.create.open}>Criar</Button>
 */
export function useModals<T extends string>(modalNames: T[]) {
  const modals = {} as Record<T, ReturnType<typeof useModal>>;

  modalNames.forEach((name) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    modals[name] = useModal();
  });

  return modals;
}
