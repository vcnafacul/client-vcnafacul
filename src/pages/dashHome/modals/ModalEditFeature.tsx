import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/molecules/button";
import ModalTemplate from "@/components/templates/modalTemplate";
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
              ...(trimmedDescription ? { description: trimmedDescription } : {}),
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
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-6 rounded-md w-[90vw] max-w-[500px]"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">
          {isCreateMode ? "Adicionar item" : "Editar item"}
        </h3>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Título</span>
          <input
            className="border rounded px-2 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do item"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Descrição (opcional)</span>
          <textarea
            className="border rounded px-2 py-1"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Texto descritivo exibido abaixo da imagem"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            Imagem {isCreateMode ? "(opcional)" : "(opcional — substitui atual)"}
          </span>
          {!isCreateMode && feature?.imageUrl && !file && (
            <img
              src={homeContentFile(feature.imageUrl)}
              alt={feature.title}
              className="w-24 h-24 object-cover rounded"
            />
          )}
          {file && (
            <span className="text-xs text-green-700">
              Imagem recortada pronta para upload.
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const picked = e.target.files?.[0];
              if (picked) {
                setPendingCrop(picked);
                e.target.value = "";
              }
            }}
          />
          <span className="text-xs text-gray-500">
            Proporção: 16:9 (a imagem será recortada).
          </span>
        </div>
        {pendingCrop && (
          <PhotoEditor
            isOpen
            photo={pendingCrop}
            aspect={HOME_IMAGE_ASPECT.feature}
            targetSize={HOME_IMAGE_SIZE.feature}
            handleClose={() => setPendingCrop(null)}
            onConfirm={(cropped) => {
              setFile(cropped);
              setPendingCrop(null);
            }}
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            size="small"
            className="w-32"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            typeStyle="primary"
            size="small"
            className="w-32"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </ModalTemplate>
  );
}
