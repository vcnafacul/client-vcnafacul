/* eslint-disable @typescript-eslint/no-explicit-any */
import DocxPreview from "@/components/atoms/docxPreview";
import NewContent from "@/pages/newsPage/newContent";
import { useEffect, useState } from "react";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import UploadButton from "../../../components/molecules/uploadButton";
import ModalTemplate from "../../../components/templates/modalTemplate";
import { News } from "../../../dtos/news/news";

const inputBaseClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-grey focus:outline-none focus:ring-2 focus:ring-green2/30 focus:border-green2";

/** Formato YYYY-MM-DD para input date; '' = sem expiração */
function toDateInputValue(d: string | Date | null | undefined): string {
  if (d == null || d === "") return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ModalEditNewProps {
  news: News | null;
  create: (session: string, title: string, file: any, expireAt?: string) => void;
  update?: (id: string, session: string, title: string, expireAt?: string) => void;
  deleteFunc: (id: string) => void;
  isOpen: boolean;
  handleClose: () => void;
}

function ModalEditNew({
  news,
  create,
  update,
  deleteFunc,
  isOpen,
  handleClose,
}: ModalEditNewProps) {
  const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
  const [upload, setUpload] = useState<boolean>(news ? true : false);
  const [session, setSession] = useState<string>(news ? news.session : "");
  const [title, setTitle] = useState<string>(news ? news.title : "");
  const [expireAt, setExpireAt] = useState<string>(
    toDateInputValue(news?.expireAt ?? "")
  );
  const [uploadFile, setUploadFile] = useState(null);

  const isEditing = !!news;
  const minDate = todayDateString();

  useEffect(() => {
    setSession(news ? news.session : "");
    setTitle(news ? news.title : "");
    setExpireAt(toDateInputValue(news?.expireAt ?? ""));
  }, [news?.id, news?.session, news?.title, news?.expireAt]);

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

  const handleSave = () => {
    if (isEditing && update) {
      update(news.id, session, title, expireAt || undefined);
    } else if (upload && !!session && !!title) {
      create(session, title, uploadFile, expireAt || undefined);
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
      className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col"
    >
      {/* Área rolável: header + formulário + preview */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <Text size="secondary">
            {isEditing ? "Detalhes da Novidade" : "Criar Novidade"}
          </Text>
        </div>

        {/* Form fields: mesmo layout (label em cima, input, texto embaixo) para alinhar */}
        <div className="px-6 py-4 shrink-0">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <label htmlFor="session" className="text-sm text-gray-600">
                Seção
              </label>
              <input
                id="session"
                type="text"
                disabled={isEditing}
                value={session}
                onChange={(e) => setSession(e.target.value)}
                placeholder="Seção"
                className={inputBaseClass}
              />
              <span className="text-xs text-gray-500 min-h-[1rem]">
                {" "}
              </span>
            </div>
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <label htmlFor="title" className="text-sm text-gray-600">
                Título
              </label>
              <input
                id="title"
                type="text"
                disabled={isEditing}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
                className={inputBaseClass}
              />
              <span className="text-xs text-gray-500 min-h-[1rem]">
                {" "}
              </span>
            </div>
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <label htmlFor="expire-at" className="text-sm text-gray-600">
                Data de expiração
              </label>
              <input
                id="expire-at"
                type="date"
                min={minDate}
                value={expireAt}
                onChange={(e) => setExpireAt(e.target.value)}
                disabled={false}
                className={inputBaseClass}
              />
              <span className="text-xs text-gray-500">
                Obrigatório. Não pode ser anterior a hoje.
              </span>
            </div>
          </div>
        </div>

        {/* Upload (only for new) */}
        {!isEditing && (
          <div className="px-6 pb-2 shrink-0">
            <UploadButton
              placeholder="Upload Novidades"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* Preview: altura limitada para não empurrar o botão para fora da tela */}
        {hasPreview && (
          <div className="px-6 py-4 shrink-0">
            <p className="text-sm text-gray-500 mb-2 font-medium">Preview</p>
            <div className="min-h-[200px] max-h-[45vh] overflow-y-auto border rounded-lg shadow-inner p-4 bg-gray-50">
              {news?.fileName ? (
                <NewContent fileKey={news.fileName} />
              ) : (
                <DocxPreview arrayBuffer={arrayBuffer!} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rodapé fixo: botões sempre visíveis */}
      <div className="px-6 py-4 border-t border-gray-100 flex gap-4 shrink-0 bg-white">
        {isEditing ? (
          <>
            <Button
              className="bg-green2 border-green2"
              hover
              onClick={handleSave}
            >
              Salvar
            </Button>
            <Button className="bg-red border-red" onClick={deleteNew}>
              Deletar
            </Button>
          </>
        ) : (
          <Button
            className="bg-green2 border-green2"
            hover
            onClick={handleSave}
          >
            Salvar
          </Button>
        )}
      </div>
    </ModalTemplate>
  );
}

export default ModalEditNew;
