/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactComponent as Preview } from "@/assets/icons/Icon-preview.svg";
import { ImagePreview } from "@/components/atoms/imagePreview";
import ModalImage from "@/components/atoms/modalImage";
import Text from "@/components/atoms/text";
import UploadButton from "@/components/molecules/uploadButton";
import ModalTemplate from "@/components/templates/modalTemplate";
import { useState } from "react";

interface Props {
  imageId: string | undefined;
  imagePreview: string | ArrayBuffer | null;
  hasQuestion: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  edit: boolean;
}

export function QuestionImage({
  imageId,
  imagePreview,
  hasQuestion,
  handleImageChange,
  edit,
}: Props) {
  const [photoOpen, setPhotoOpen] = useState<boolean>(false);

  const QuestionImageModal = () => {
    return (
      <ModalTemplate
        isOpen={photoOpen}
        handleClose={() => setPhotoOpen(false)}
        outSideClose
      >
        <ModalImage
          image={`https://api.vcnafacul.com.br/images/${imageId}.png`}
        />
      </ModalTemplate>
    );
  };

  return (
    <>
      <div>
        <Text
          className="flex w-full justify-center gap-4 items-center"
          size="tertiary"
        >
          Imagem da Questão
        </Text>
        {hasQuestion ? (
          <div className="p-1 m-1 flex-col">
            <div className="flex justify-center items-center border py-2">
              {imagePreview ? (
                <ImagePreview imagePreview={imagePreview} />
              ) : (
                <img
                  className="max-h-52 p-[1px] mr-4 sm:m-0 cursor-pointer"
                  src={`https://api.vcnafacul.com.br/images/${
                    imageId || ""
                  }.png`}
                  onClick={() => setPhotoOpen(true)}
                />
              )}
            </div>
            {edit ? (
              <UploadButton
                placeholder="Alterar imagem"
                onChange={handleImageChange}
                accept=".png"
              />
            ) : (
              <></>
            )}
          </div>
        ) : (
          <div>
            <div className="border py-4 flex justify-center items-center h-1/2">
              {imagePreview ? (
                <ImagePreview imagePreview={imagePreview} />
              ) : (
                <div className="h-60 flex justify-center items-center">
                  <Preview className="h-32 w-32" />
                </div>
              )}
            </div>
            <UploadButton
              placeholder="Upload Imagem"
              onChange={handleImageChange}
              accept=".png"
            />
          </div>
        )}
      </div>
      <QuestionImageModal />
    </>
  );
}
