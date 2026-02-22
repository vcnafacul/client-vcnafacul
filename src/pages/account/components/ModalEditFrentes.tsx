import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CollaboratorFrentes } from './CollaboratorFrentes';

interface ModalEditFrentesProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  initialSelectedIds: string[];
  onSave: (selectedIds: string[]) => Promise<void>;
}

export function ModalEditFrentes({
  isOpen,
  onClose,
  token,
  initialSelectedIds,
  onSave,
}: ModalEditFrentesProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isSaving, setIsSaving] = useState(false);

  // Resetar estado quando modal abrir ou initialSelectedIds mudar
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
    }
  }, [isOpen, initialSelectedIds]);

  const handleSelectionChange = (frentesIds: string[]) => {
    setSelectedIds(frentesIds);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(selectedIds);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar frentes:', error);
      // O erro já é tratado pelo onSave (useToastAsync)
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedIds(initialSelectedIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Frentes de Afinidade</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <CollaboratorFrentes
            token={token}
            initialSelectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
          />
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

