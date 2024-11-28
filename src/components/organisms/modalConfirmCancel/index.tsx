import React from "react";
import Text from "../../atoms/text";
import Button from "../../molecules/button";
import ModalTemplate, { ModalProps } from "../../templates/modalTemplate";

export interface ModalConfirmCancelProps extends ModalProps {
  handleConfirm: (string?: string) => void;
  confirmDisabled?: boolean;
  text?: string;
  children?: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

function ModalConfirmCancel({
  handleConfirm,
  confirmDisabled,
  text,
  children,
  handleClose,
  isOpen,
  className,
}: ModalConfirmCancelProps) {
  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className={className}
    >
      <div className="px-4 md:max-w-[700px] rounded-2xl flex flex-col gap-4">
        <Text size="tertiary" className="font-black m-0 text-start">
          {text}
        </Text>
        {children}
        <div className="flex gap-2 justify-end">
          <Button
            disabled={confirmDisabled ?? false}
            size="small"
            typeStyle="secondary"
            hover
            onClick={() => {
              handleClose!();
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={confirmDisabled ?? false}
            size="small"
            typeStyle="primary"
            hover
            onClick={() => {
              handleConfirm();
            }}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ModalConfirmCancel;
