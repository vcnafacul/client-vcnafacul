import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "../../../store/auth";
import { HomeFeature } from "../../../dtos/homeContent/homeFeature";
import { createHomeFeature } from "../../../services/home/createHomeFeature";
import { updateHomeFeature } from "../../../services/home/updateHomeFeature";
import { uploadHomeFeatureImage } from "../../../services/home/uploadHomeFeatureImage";
import { homeContentFile } from "../../../services/urls";
import PhotoEditor from "@/components/atoms/photoEditor";
import { HOME_IMAGE_ASPECT, HOME_IMAGE_SIZE } from "../constants";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  feature: HomeFeature | null;
  onCreated: (feature: HomeFeature) => void;
  onUpdated: (feature: HomeFeature) => void;
}

export default function ModalEditFeature({
  isOpen,
  handleClose,
  feature,
  onCreated,
  onUpdated,
}: Props) {
  const {
    data: { token },
  } = useAuthStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pendingCrop, setPendingCrop] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(feature?.title ?? "");
      setDescription(feature?.description ?? "");
      setFile(null);
      setPendingCrop(null);
    }
  }, [isOpen, feature]);

  const isCreateMode = feature === null;

  const onSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Título é obrigatório");
      return;
    }
    const trimmedDescription = description.trim();
    setSaving(true);
    try {
      if (isCreateMode) {
        let created: HomeFeature;
        try {
          created = await createHomeFeature(
            {
              title: trimmed,
              ...(trimmedDescription
                ? { description: trimmedDescription }
                : {}),
            },
            token,
          );
        } catch (err) {
          toast.error((err as Error).message);
          setSaving(false);
          return;
        }
        if (file) {
          try {
            const withImage = await uploadHomeFeatureImage(
              created.id,
              file,
              token,
            );
            onCreated(withImage);
            toast.success("Item criado");
          } catch (err) {
            toast.error(
              `Item criado, mas falha no upload da imagem: ${
                (err as Error).message
              }`,
            );
            onCreated(created);
          }
        } else {
          onCreated(created);
          toast.success("Item criado");
        }
        handleClose();
      } else {
        let current: HomeFeature = feature;
        const payload: { title?: string; description?: string } = {};
        if (trimmed !== feature.title) payload.title = trimmed;
        if (trimmedDescription !== (feature.description ?? ""))
          payload.description = trimmedDescription;
        if (Object.keys(payload).length > 0) {
          current = await updateHomeFeature(feature.id, payload, token);
        }
        if (file) {
          current = await uploadHomeFeatureImage(feature.id, file, token);
        }
        onUpdated(current);
        toast.success("Item atualizado");
        handleClose();
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen && !pendingCrop}
        onOpenChange={(o) => !o && handleClose()}
      >
        <DialogContent
          size="md"
          aria-describedby={undefined}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Adicionar item" : "Editar item"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="-mx-1 px-1 pt-2">
            <form
              id="form-edit-feature"
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <label className="flex flex-col gap-1">
                <span className="text-body font-semibold">Título</span>
                <input
                  className="border rounded-sm px-2 py-1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do item"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-body font-semibold">
                  Descrição (opcional)
                </span>
                <textarea
                  className="border rounded-sm px-2 py-1"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Texto descritivo exibido abaixo da imagem"
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-body font-semibold">
                  Imagem{" "}
                  {isCreateMode ? "(opcional)" : "(opcional — substitui atual)"}
                </span>
                {!isCreateMode && feature?.imageUrl && !file && (
                  <img
                    src={homeContentFile(feature.imageUrl)}
                    alt={feature.title}
                    className="w-24 h-24 object-cover rounded-sm"
                  />
                )}
                {file && (
                  <span className="text-caption text-success">
                    Imagem recortada pronta para upload.
                  </span>
                )}
                <input
                  type="file"
                  aria-label="Imagem"
                  accept="image/*"
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    if (picked) {
                      setPendingCrop(picked);
                      e.target.value = "";
                    }
                  }}
                />
                <span className="text-caption text-muted-foreground">
                  Proporção: 16:9. Salvo como PNG — fundo transparente é
                  preservado.
                </span>
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" form="form-edit-feature" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Fora do Dialog: o editor de foto é um modal V1 e o Radix deixa o body sem clique (059/01, portal). */}
      {pendingCrop && (
        <PhotoEditor
          isOpen
          photo={pendingCrop}
          aspect={HOME_IMAGE_ASPECT.feature}
          targetSize={HOME_IMAGE_SIZE.feature}
          outputFormat="image/png"
          handleClose={() => setPendingCrop(null)}
          onConfirm={(cropped) => {
            setFile(cropped);
            setPendingCrop(null);
          }}
        />
      )}
    </>
  );
}
