import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import React from "react";

export interface ModalConfirmCancelProps {
  handleConfirm: (string?: string) => void;
  confirmDisabled?: boolean;
  text?: string;
  children?: React.ReactNode;
  handleClose: () => void;
  isOpen: boolean;
  className?: string;
}

export default function ModalConfirmCancel({
  handleConfirm,
  confirmDisabled = false,
  text,
  children,
  handleClose,
  isOpen,
  className,
}: ModalConfirmCancelProps) {
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {/* Sem a largura calculada o card encosta nas bordas no celular. */}
      <DialogContent
        className={cn("w-[calc(100%-2rem)] max-w-xl rounded-2xl", className)}
      >
        {text && <h2 className="text-lg font-bold">{text}</h2>}

        {children}

        <DialogFooter className="flex flex-row justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} className="w-24">
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={() => handleConfirm()}
            disabled={confirmDisabled}
            className="w-24"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
