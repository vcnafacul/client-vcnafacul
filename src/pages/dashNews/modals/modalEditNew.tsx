/* eslint-disable @typescript-eslint/no-explicit-any */
import DocxPreview from "@/components/atoms/docxPreview";
import RichTextEditor from "@/components/molecules/richTextEditor/RichTextEditor";
import NewContent from "@/pages/newsPage/newContent";
import { getNewsAssetImage } from "@/services/news/getNewsAssetImage";
import { uploadNewsAsset } from "@/services/news/uploadNewsAsset";
import { useAuthStore } from "@/store/auth";
import { News } from "@/dtos/news/news";
import { PendingImageStore } from "@/utils/pendingImageStore";
import { useEffect, useRef, useState } from "react";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import UploadButton from "../../../components/molecules/uploadButton";
import ModalTemplate from "../../../components/templates/modalTemplate";

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
  create: (
    title: string,
    options: {
      description?: string;
      destaque: boolean;
      expireAt?: string;
      contentType: 'file' | 'text';
      body?: string;
      file?: File | null;
    }
  ) => void;
  update?: (
    id: string,
    options: {
      title: string;
      description: string | null;
      destaque: boolean;
      expireAt?: string;
      body?: string;
    }
  ) => void;
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
  const [destaque, setDestaque] = useState<boolean>(news?.destaque ?? false);
  const [description, setDescription] = useState<string>(news?.description ?? "");
  const [title, setTitle] = useState<string>(news ? news.title : "");
  const [expireAt, setExpireAt] = useState<string>(
    toDateInputValue(news?.expireAt ?? "")
  );
  const [uploadFile, setUploadFile] = useState(null);
  const [contentType, setContentType] = useState<'file' | 'text'>(news?.contentType ?? 'file');
  const [body, setBody] = useState<string>(news?.body ?? "");
  const pendingStoreRef = useRef<PendingImageStore>(new PendingImageStore());
  const { data: { token } } = useAuthStore();

  const isEditing = !!news;
  const minDate = todayDateString();

  useEffect(() => {
    setDestaque(news?.destaque ?? false);
    setDescription(news?.description ?? "");
    setTitle(news ? news.title : "");
    setExpireAt(toDateInputValue(news?.expireAt ?? ""));
    setContentType(news?.contentType ?? 'file');
    setBody(news?.body ?? "");
  }, [news?.id, news?.title, news?.destaque, news?.description, news?.expireAt, news?.contentType, news?.body]);

  useEffect(() => {
    const store = pendingStoreRef.current;
    return () => {
      store.cleanup();
    };
  }, []);

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

  async function flushPendingImages(rawBody: string): Promise<string> {
    pendingStoreRef.current.pruneUnused(rawBody);
    const replacements = await pendingStoreRef.current.uploadAll((file) =>
      uploadNewsAsset(file, token)
    );
    return PendingImageStore.replaceInMarkdown(rawBody, replacements);
  }

  const handleSave = async () => {
    if (isEditing && update) {
      let finalBody: string | undefined;
      if (contentType === 'text') {
        finalBody = await flushPendingImages(body);
      }
      update(news.id, {
        title,
        description: description.trim() || null,
        destaque,
        expireAt: expireAt || undefined,
        body: finalBody,
      });
    } else if (contentType === 'file' && upload && !!title) {
      create(title, {
        description: description.trim() || undefined,
        destaque,
        expireAt: expireAt || undefined,
        contentType: 'file',
        file: uploadFile,
      });
    } else if (contentType === 'text' && body.trim() && !!title) {
      const finalBody = await flushPendingImages(body);
      create(title, {
        description: description.trim() || undefined,
        destaque,
        expireAt: expireAt || undefined,
        contentType: 'text',
        body: finalBody,
      });
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
          {/* Tab switcher: only visible in create mode */}
          {!isEditing && (
            <div className="mb-4 flex gap-2 border-b border-gray-200">
              <button
                type="button"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  contentType === 'file'
                    ? 'border-green2 text-green2'
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setContentType('file')}
              >
                Upload de arquivo
              </button>
              <button
                type="button"
                className={`px-3 py-2 text-sm font-medium border-b-2 ${
                  contentType === 'text'
                    ? 'border-green2 text-green2'
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setContentType('text')}
              >
                Escrever texto
              </button>
            </div>
          )}
          {isEditing && (
            <div className="mb-4 text-sm text-gray-500">
              Tipo: <strong>{contentType === 'text' ? 'Texto (markdown)' : 'Arquivo (.docx)'}</strong>
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <label htmlFor="destaque" className="text-sm text-gray-600">
                Destaque
              </label>
              <label className="inline-flex items-center gap-2 mt-2">
                <input
                  id="destaque"
                  type="checkbox"
                  checked={destaque}
                  onChange={(e) => setDestaque(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm">Marcar como novidade em destaque</span>
              </label>
              <span className="text-xs text-gray-500 min-h-[1rem]">
                Apenas uma novidade pode estar em destaque por vez.
              </span>
            </div>
            <div className="flex-1 min-w-[200px] flex flex-col gap-1">
              <label htmlFor="title" className="text-sm text-gray-600">
                Título
              </label>
              <input
                id="title"
                type="text"
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

        {/* Description textarea */}
        <div className="px-6 pb-2 shrink-0">
          <label htmlFor="description" className="text-sm text-gray-600">
            Descrição (opcional, máx 280 caracteres)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 280))}
            maxLength={280}
            rows={3}
            placeholder="Aparece no card destaque, abaixo do título"
            className={inputBaseClass + " resize-none"}
          />
          <span className="text-xs text-gray-500">
            {description.length}/280
          </span>
        </div>

        {/* Content section: file upload/preview OR rich text editor */}
        {contentType === 'file' ? (
          <>
            {!isEditing && (
              <div className="px-6 pb-2 shrink-0">
                <UploadButton
                  placeholder="Upload Novidades"
                  onChange={handleFileUpload}
                />
              </div>
            )}
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
          </>
        ) : (
          <div className="px-6 py-4 shrink-0">
            <p className="text-sm text-gray-500 mb-2 font-medium">Conteúdo</p>
            <RichTextEditor
              content={body}
              onChange={setBody}
              onImageUpload={async (file: File) => {
                return pendingStoreRef.current.add(file);
              }}
              pendingStore={pendingStoreRef.current}
              token={token}
              fetchAsset={getNewsAssetImage}
              minHeight="240px"
              placeholder="Escreva a novidade aqui. Suporta markdown, fórmulas LaTeX ($x^2$) e imagens inline."
            />
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
