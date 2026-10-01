import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import { ModalType } from "../../../types/simulado/modalType";

interface ModalInfoProps {
  modal: ModalType;
}

function ModalInfo({ modal }: ModalInfoProps) {
  return (
    // z-50 e margem: sem z-index o overlay podia ficar atrás do conteúdo, e a
    // caixa encostava nas bordas do celular.
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 p-4">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white p-5 sm:p-10 w-full max-w-[700px] rounded max-h-full overflow-y-auto">
            <Text className="text-start">{modal.title}</Text>
            <Text size="tertiary" className="text-start">
              {modal.subTitle}
            </Text>
            <div className="flex flex-wrap justify-between gap-4">
              {modal.buttons.map((btn, index) => (
                <Button
                  key={index}
                  size="small"
                  className="w-fit min-w-[150px]"
                  typeStyle={btn.type}
                  onClick={btn.onClick}
                >
                  {btn.children}
                </Button>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}

export default ModalInfo;
