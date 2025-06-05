/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import ModalConfirmCancel, {
  ModalConfirmCancelProps,
} from "../modalConfirmCancel";

function ModalConfirmCancelMessage({
  handleConfirm,
  text,
  isOpen,
  handleClose,
  className,
}: ModalConfirmCancelProps) {
  const [message, setMessage] = useState<string>("");
  return (
    <ModalConfirmCancel
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={() => {
        handleConfirm(message);
      }}
      text={text}
      confirmDisabled={!message}
      className={className}
    >
      <textarea
        onChange={(event: any) => {
          setMessage(event.target.value);
        }}
        className="p-2 w-full border border-gray-400 rounded h-full min-h-[100px] resize-none"
      />
    </ModalConfirmCancel>
  );
}

export default ModalConfirmCancelMessage;
