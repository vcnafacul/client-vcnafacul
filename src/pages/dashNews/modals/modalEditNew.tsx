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
import { Button } from "@/components/ui/button";
import UploadButton from "../../../components/molecules/uploadButton";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const inputBaseClass =
  "w-full border border-border rounded-md px-3 py-2 text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:border-success";

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
      contentType: "file" | "text";
      body?: string;
      file?: File | null;
    },
  ) => void;
  update?: (
    id: string,
    options: {
      title: string;
      description: string | null;
      destaque: boolean;
      expireAt?: string;
      body?: string;
    },
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
  const [description, setDescription] = useState<string>(
    news?.description ?? "",
  );
  const [title, setTitle] = useState<string>(news ? news.title : "");
  const [expireAt, setExpireAt] = useState<string>(
    toDateInputValue(news?.expireAt ?? ""),
  );
  const [uploadFile, setUploadFile] = useState(null);
  const [contentType, setContentType] = useState<"file" | "text">(
    news?.contentType ?? "file",
  );
  const [body, setBody] = useState<string>(news?.body ?? "");
  const pendingStoreRef = useRef<PendingImageStore>(new PendingImageStore());
  const {
    data: { token },
  } = useAuthStore();

  const isEditing = !!news;
  const minDate = todayDateString();

  useEffect(() => {
    setDestaque(news?.destaque ?? false);
    setDescription(news?.description ?? "");
    setTitle(news ? news.title : "");
    setExpireAt(toDateInputValue(news?.expireAt ?? ""));
    setContentType(news?.contentType ?? "file");
    setBody(news?.body ?? "");
  }, [
    news?.id,
    news?.title,
    news?.destaque,
    news?.description,
    news?.expireAt,
    news?.contentType,
    news?.body,
  ]);

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
      uploadNewsAsset(file, token),
    );
    return PendingImageStore.replaceInMarkdown(rawBody, replacements);
  }

  const handleSave = async () => {
    if (isEditing && update) {
      let finalBody: string | undefined;
      if (contentType === "text") {
        finalBody = await flushPendingImages(body);
      }
      update(news.id, {
        title,
        description: description.trim() || null,
        destaque,
        expireAt: expireAt || undefined,
        body: finalBody,
      });
    } else if (contentType === "file" && upload && !!title) {
      create(title, {
        description: description.trim() || undefined,
        destaque,
        expireAt: expireAt || undefined,
        contentType: "file",
        file: uploadFile,
      });
    } else if (contentType === "text" && body.trim() && !!title) {
      const finalBody = await flushPendingImages(body);
      create(title, {
        description: description.trim() || undefined,
        destaque,
        expireAt: expireAt || undefined,
        contentType: "text",
        body: finalBody,
      });
    }
  };

  // Excluir tira a novidade do site: confirma antes (apagava direto).
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const deleteNew = () => {
    setConfirmarExclusao(false);
    if (news) {
      deleteFunc(news.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        size="full"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Detalhes da Novidade" : "Criar Novidade"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {/* Form fields: mesmo layout (label em cima, input, texto embaixo) para alinhar */}
          <div className="py-4">
            {/* Tab switcher: only visible in create mode */}
            {!isEditing && (
              <Tabs
                value={contentType}
                onValueChange={(v) => setContentType(v as "file" | "text")}
                className="mb-4"
              >
                <TabsList>
                  <TabsTrigger value="file">Upload de arquivo</TabsTrigger>
                  <TabsTrigger value="text">Escrever texto</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            {isEditing && (
              <div className="mb-4 text-body text-muted-foreground">
                Tipo:{" "}
                <strong>
                  {contentType === "text"
                    ? "Texto (markdown)"
                    : "Arquivo (.docx)"}
                </strong>
              </div>
            )}

            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                <label
                  htmlFor="destaque"
                  className="text-body text-muted-foreground"
                >
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
                  <span className="text-body">
                    Marcar como novidade em destaque
                  </span>
                </label>
                <span className="text-caption text-muted-foreground min-h-[1rem]">
                  Apenas uma novidade pode estar em destaque por vez.
                </span>
              </div>
              <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                <label
                  htmlFor="title"
                  className="text-body text-muted-foreground"
                >
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
                <span className="text-caption text-muted-foreground min-h-[1rem]">
                  {" "}
                </span>
              </div>
              <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                <label
                  htmlFor="expire-at"
                  className="text-body text-muted-foreground"
                >
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
                <span className="text-caption text-muted-foreground">
                  Obrigatório. Não pode ser anterior a hoje.
                </span>
              </div>
            </div>
          </div>

          {/* Description textarea */}
          <div className="pb-2">
            <label
              htmlFor="description"
              className="text-body text-muted-foreground"
            >
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
            <span className="text-caption text-muted-foreground">
              {description.length}/280
            </span>
          </div>

          {/* Content section: file upload/preview OR rich text editor */}
          {contentType === "file" ? (
            <>
              {!isEditing && (
                <div className="pb-2">
                  <UploadButton
                    placeholder="Upload Novidades"
                    onChange={handleFileUpload}
                  />
                </div>
              )}
              {hasPreview && (
                <div className="py-4">
                  <p className="text-body text-muted-foreground mb-2 font-medium">
                    Preview
                  </p>
                  <div className="min-h-[200px] max-h-[45vh] overflow-y-auto border rounded-lg p-4 bg-page">
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
            <div className="py-4">
              <p className="text-body text-muted-foreground mb-2 font-medium">
                Conteúdo
              </p>
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

          <AlertDialog
            open={confirmarExclusao}
            onOpenChange={(aberto) => {
              if (!aberto) {
                setConfirmarExclusao(false);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{`Excluir a novidade "${news?.title ?? ""}"?`}</AlertDialogTitle>
                <AlertDialogDescription>
                  Ela deixa de aparecer no site.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={deleteNew}>
                  Excluir novidade
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogBody>
        <DialogFooter>
          {isEditing ? (
            <>
              <Button
                variant="destructive"
                onClick={() => setConfirmarExclusao(true)}
              >
                Deletar
              </Button>
              <Button variant="cta" onClick={handleSave}>
                Salvar
              </Button>
            </>
          ) : (
            <Button variant="cta" onClick={handleSave}>
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalEditNew;
