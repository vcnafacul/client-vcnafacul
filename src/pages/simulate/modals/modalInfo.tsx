import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import { ModalType } from "../../../types/simulado/modalType";

interface ModalInfoProps {
  modal: ModalType;
}

function ModalInfo({ modal }: ModalInfoProps) {
  return (
    <>
      <div className="bg-white p-10 max-w-[700px] rounded">
        <Text className="text-start">{modal.title}</Text>
        <Text size="tertiary" className="text-start">
          {modal.subTitle}
        </Text>
        <div className="flex gap-4">
          {modal.buttons.map((btn, index) => (
            <Button
              key={index}
              hover
              typeStyle={btn.type}
              onClick={btn.onClick}
            >
              {btn.children}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

export default ModalInfo;
