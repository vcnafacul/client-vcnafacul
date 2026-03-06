/* eslint-disable @typescript-eslint/no-explicit-any */
import DocxPreview from "@/components/atoms/docxPreview";
import NewContent from "@/pages/newsPage/newContent";
import { useState } from "react";
import Filter from "../../../components/atoms/filter";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import UploadButton from "../../../components/molecules/uploadButton";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { News } from "../../../dtos/news/news";

interface ModalEditNewProps {
  news: News;
  create: (session: string, title: string, file: any) => void;
  deleteFunc: (id: string) => void;
  isOpen: boolean;
  handleClose: () => void;
}

function ModalEditNew({
  news,
  create,
  deleteFunc,
  isOpen,
  handleClose,
}: ModalEditNewProps) {
  const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
  const [upload, setUpload] = useState<boolean>(news ? true : false);
  const [session, setSession] = useState<string>(news ? news.session : "");
  const [title, setTitle] = useState<string>(news ? news.title : "");
  const [uploadFile, setUploadFile] = useState(null);

  const isEditing = !!news;

  const hasPreview = !!(news?.fileName || (upload && arrayBuffer));

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const arrayBuffer = event.target.result;
        setUpload(true);
        setArrayBufer(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const createNew = () => {
    if (isEditing || (upload && !!session && !!title)) {
      create(session, title, uploadFile);
    }
  };

  const deleteNew = () => {
    if (news) {
      deleteFunc(news.id);
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-full max-w-4xl bg-white rounded-lg overflow-hidden"
    >
      <div className="flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <Text size="secondary">
            {isEditing ? "Detalhes da Novidade" : "Criar Novidade"}
          </Text>
        </div>

        {/* Form fields */}
        <div className="px-6 py-4">
          <div className="flex gap-4 flex-wrap">
            <Filter
              disabled={isEditing}
              defaultValue={session}
              search={false}
              className="border rounded-md flex-1 min-w-[200px]"
              filtrar={(e) => setSession(e.target.value)}
              placeholder="Seção"
            />
            <Filter
              disabled={isEditing}
              defaultValue={title}
              search={false}
              className="border rounded-md flex-1 min-w-[200px]"
              filtrar={(e) => setTitle(e.target.value)}
              placeholder="Título"
            />
          </div>
        </div>

        {/* Upload (only for new) */}
        {!isEditing && (
          <div className="px-6 pb-2">
            <UploadButton
              placeholder="Upload Novidades"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Preview (only when there's content to render) */}
        {hasPreview && (
          <div className="px-6 py-4">
            <p className="text-sm text-gray-500 mb-2 font-medium">Preview</p>
            <div className="h-[400px] overflow-y-auto border rounded-lg shadow-inner p-4 bg-gray-50">
              {news?.fileName ? (
                <NewContent fileKey={news.fileName} />
              ) : (
                <DocxPreview arrayBuffer={arrayBuffer!} />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-4">
          {isEditing ? (
            <Button className="bg-red border-red" onClick={deleteNew}>
              Deletar
            </Button>
          ) : (
            <Button
              className="bg-green2 border-green2"
              hover
              onClick={createNew}
            >
              Salvar
            </Button>
          )}
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ModalEditNew;
