import Button from "@/components/molecules/button";
import { BtnProps } from "@/types/generic/btnProps";

interface Props {
  hasQuestion: boolean;
  isEditing: boolean;
  btns: BtnProps[];
  handleClose: () => void;
  disabled: boolean;
}

export function QuestionButton({
  hasQuestion,
  isEditing,
  btns,
  handleClose,
  disabled,
}: Props) {
  if (hasQuestion) {
    return btns.map((btn, index) => {
      if (isEditing === btn.editing) {
        return (
          <div key={index} className={`${btn.className} rounded`}>
            <Button
              disabled={btn.disabled}
              type={btn.type}
              onClick={btn.onClick}
              typeStyle={btn.typeStyle}
              hover
              className={`${btn.className} w-full border-none`}
            >
              {btn.children}
            </Button>
          </div>
        );
      }
    });
  }
  return (
    <div className="flex flex-col gap-1 col-span-2">
      <Button type="submit" disabled={disabled}>
        Salvar
      </Button>
      <Button type="button" onClick={handleClose}>
        Fechar
      </Button>
    </div>
  );
}
